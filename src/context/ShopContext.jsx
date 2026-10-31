'use client';

import { useContext, createContext, useState, useEffect, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import axios from "axios";
import { getUnitPrice, getVariantStock, getVariantLabelError } from "../utils/pricing";

export const ShopContext = createContext();

const GUEST_CART_KEY = "vellora_cart";

// JWT payloads are base64url, which atob() can't read directly
const decodeJwtPayload = (jwt) => {
  const base64 = jwt.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  return JSON.parse(atob(padded));
};

const readGuestCart = () => {
  try {
    return JSON.parse(localStorage.getItem(GUEST_CART_KEY) || "{}") || {};
  } catch {
    return {};
  }
};

const ShopContextProvider = (props) => {
  const currency = "$";
  const delivery_fee = 10;
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(true);
  const [cartItems, setCartItems] = useState({});
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");
  const [token, setToken] = useState("");
  const [authReady, setAuthReady] = useState(false);
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "http://localhost:4000";
  const router = useRouter();
  const cartRef = useRef(cartItems);
  cartRef.current = cartItems;

  // Admin and seller accounts can sign in here but the server rejects their carts and orders
  const tokenRole = (() => {
    if (!token) return null;
    try {
      return decodeJwtPayload(token).role || "user";
    } catch {
      return null;
    }
  })();
  const isStaffAccount = tokenRole === "admin" || tokenRole === "seller";
  const STAFF_MESSAGE = "Staff accounts can't shop. Please log in with a customer account to buy.";

  const navigate = (path) => {
    router.push(path);
  };

  const getErrorMessage = (error) =>
    error?.response?.data?.message || error?.message || "Something went wrong";

  /**
   * Add one unit of a product option. Returns true when it was added.
   * The local cart is rolled back if the server rejects it (stock, invalid option, role).
   */
  const addToCart = async (itemId, variantLabel) => {
    if (isStaffAccount) {
      toast.error(STAFF_MESSAGE);
      return false;
    }

    const itemInfo = products.find((p) => p._id === itemId);
    if (!itemInfo) {
      toast.error("This product is no longer available");
      return false;
    }

    const optionError = getVariantLabelError(itemInfo, variantLabel);
    if (optionError) {
      toast.error(optionError);
      return false;
    }

    const previous = cartRef.current;
    const currentQty = Number(previous[itemId]?.[variantLabel]) || 0;
    const available = getVariantStock(itemInfo, variantLabel);
    if (currentQty + 1 > available) {
      toast.error(available <= 0 ? "This option is out of stock" : `Only ${available} available — already in your bag`);
      return false;
    }

    const cartData = structuredClone(previous);
    cartData[itemId] = { ...(cartData[itemId] || {}), [variantLabel]: currentQty + 1 };
    setCartItems(cartData);

    if (token) {
      try {
        await axios.post(
          backendUrl + "/api/v1/cart/add",
          { itemId, size: variantLabel },
          { headers: { token } },
        );
      } catch (error) {
        setCartItems(previous);
        toast.error(getErrorMessage(error));
        return false;
      }
    }
    return true;
  };

  const getCartCount = () => {
    let totalCount = 0;
    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        if (cartItems[items][item] > 0) {
          totalCount += cartItems[items][item];
        }
      }
    }
    return totalCount;
  };

  // Set a line's quantity (0 removes it). Rolled back if the server rejects it.
  const updateQuantity = async (itemId, size, quantity) => {
    const previous = cartRef.current;
    const cartData = structuredClone(previous);
    if (!cartData[itemId]) return false;

    if (quantity <= 0) {
      delete cartData[itemId][size];
      if (Object.keys(cartData[itemId]).length === 0) delete cartData[itemId];
    } else {
      cartData[itemId][size] = quantity;
    }
    setCartItems(cartData);

    if (token) {
      try {
        await axios.post(
          backendUrl + "/api/v1/cart/update",
          { itemId, size, quantity },
          { headers: { token } },
        );
      } catch (error) {
        setCartItems(previous);
        toast.error(getErrorMessage(error));
        return false;
      }
    }
    return true;
  };

  // Uses the same per-option pricing as checkout, so the total shown is the total charged
  const getCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItems) {
      const itemInfo = products.find((product) => product._id === items);
      if (!itemInfo) continue;
      for (const item in cartItems[items]) {
        if (cartItems[items][item] > 0) {
          totalAmount += getUnitPrice(itemInfo, item) * cartItems[items][item];
        }
      }
    }
    return Math.round(totalAmount * 100) / 100;
  };

  const getProductsData = async () => {
    try {
      setProductsLoading(true);
      const res = await axios.get(backendUrl + "/api/v1/product/list");
      if (res.data.success && Array.isArray(res.data.data)) {
        setProducts(res.data.data);
        setProductsError("");
      }
    } catch (error) {
      setProductsError("We couldn't load the catalog. Please check your connection and try again.");
      console.warn("Backend product service unavailable:", error.message);
    } finally {
      setProductsLoading(false);
    }
  };

  /**
   * Load the account cart. A guest cart built before login is merged in (quantities added)
   * and saved to the account so nothing is lost.
   */
  const syncUserCart = useCallback(async (userToken) => {
    try {
      const res = await axios.post(
        backendUrl + "/api/v1/cart/get",
        {},
        { headers: { token: userToken } },
      );
      const serverCart = (res.data.success && res.data.data) || {};
      const guestCart = readGuestCart();
      const merged = structuredClone(serverCart);

      for (const itemId in guestCart) {
        for (const label in guestCart[itemId]) {
          const guestQty = Number(guestCart[itemId][label]) || 0;
          if (guestQty <= 0) continue;
          const newQty = (Number(merged[itemId]?.[label]) || 0) + guestQty;
          try {
            await axios.post(
              backendUrl + "/api/v1/cart/update",
              { itemId, size: label, quantity: newQty },
              { headers: { token: userToken } },
            );
            merged[itemId] = { ...(merged[itemId] || {}), [label]: newQty };
          } catch (error) {
            console.warn("Couldn't move a guest cart item to your account:", getErrorMessage(error));
          }
        }
      }

      localStorage.removeItem(GUEST_CART_KEY);
      setCartItems(merged);
    } catch (error) {
      console.warn("Unable to sync remote cart:", getErrorMessage(error));
    }
  }, [backendUrl]);

  useEffect(() => {
    getProductsData();
  }, []);

  // Restore session or guest cart on first load
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    } else {
      setCartItems(readGuestCart());
    }
    setAuthReady(true);
  }, []);

  // Whenever a session starts (page load or login), load and merge the account cart
  useEffect(() => {
    if (!token) return;
    if (isStaffAccount) {
      toast.info(STAFF_MESSAGE, { toastId: "staff-account" });
      return;
    }
    syncUserCart(token);
  }, [token, isStaffAccount, syncUserCart]);

  // Persist guest cart
  useEffect(() => {
    if (authReady && !token) {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cartItems));
    }
  }, [cartItems, token, authReady]);

  const clearSession = () => {
    localStorage.removeItem("token");
    localStorage.removeItem(GUEST_CART_KEY);
    setToken("");
    setCartItems({});
  };

  const logout = async () => {
    try {
      const activeToken = token || localStorage.getItem("token");
      if (activeToken) {
        await axios.post(
          backendUrl + "/api/v1/user/logout",
          {},
          { headers: { token: activeToken } }
        );
      }
    } catch (error) {
      console.error("Logout error:", error?.response?.data || error.message);
    } finally {
      clearSession();
      router.push("/login");
    }
  };

  // A 401 on an authenticated request means the session is no longer valid (expired, revoked, logged out elsewhere)
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        const sentToken = error?.config?.headers?.token;
        if (error?.response?.status === 401 && sentToken && sentToken === localStorage.getItem("token")) {
          clearSession();
          toast.info("Your session has ended. Please log in again.");
          router.push("/login");
        }
        return Promise.reject(error);
      },
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, [router]);

  useEffect(() => {
    if (!token) return;

    function logoutUser() {
      toast.info(
        "For security reasons, your session expired. Please login again.",
      );
      logout();
    }

    try {
      const payload = decodeJwtPayload(token);
      if (!payload.exp) return;
      const expiryTime = payload.exp * 1000 - Date.now();

      if (expiryTime <= 0) {
        logoutUser();
      } else {
        // setTimeout overflows above ~24.8 days; skip the timer for very long sessions
        if (expiryTime > 2147483647) return;
        const timer = setTimeout(logoutUser, expiryTime);
        return () => clearTimeout(timer);
      }
    } catch (error) {
      logoutUser();
    }
  }, [token]);

  const value = {
    products,
    productsLoading,
    productsError,
    currency,
    delivery_fee,
    navigate,
    router,
    search,
    showSearch,
    setSearch,
    setShowSearch,
    cartItems,
    addToCart,
    setCartItems,
    getCartCount,
    updateQuantity,
    getCartAmount,
    backendUrl,
    token,
    setToken,
    isStaffAccount,
    logout,
  };

  return (
    <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>
  );
};

export default ShopContextProvider;

export const useShopContext = () => {
  return useContext(ShopContext);
};

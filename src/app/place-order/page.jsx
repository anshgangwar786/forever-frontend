'use client';

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Title from "../../components/Title";
import CartTotal from "../../components/CartTotal";
import { assets } from "../../assets/assets";
import { useShopContext } from "../../context/ShopContext";
import { formatMoney, getUnitPrice, getVariantImage } from "../../utils/pricing";
import axios from "axios";
import { toast } from "react-toastify";

const getImageSrc = (img) => (typeof img === "object" && img?.src ? img.src : img);

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  street: "",
  city: "",
  state: "",
  zipcode: "",
  country: "",
  phone: "",
};

const ADDRESS_FIELDS = Object.keys(EMPTY_FORM);

// Keep only the fields the form knows about, as trimmed strings
const toFormAddress = (address = {}) =>
  ADDRESS_FIELDS.reduce((acc, key) => ({ ...acc, [key]: String(address?.[key] ?? "").trim() }), {});

const addressKey = (a) =>
  [a.street, a.city, a.zipcode, a.phone].map((v) => String(v || "").toLowerCase().replace(/\s+/g, " ")).join("|");

const isFormEmpty = (data) => ADDRESS_FIELDS.every((key) => !String(data[key] || "").trim());

const Field = ({ label, name, value, onChange, type = "text", autoComplete, className = "", ...rest }) => (
  <label className={`block ${className}`}>
    <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted mb-1.5">{label}</span>
    <input
      name={name}
      value={value}
      onChange={onChange}
      type={type}
      autoComplete={autoComplete}
      required
      className="w-full bg-surface border border-hairline rounded-lg px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint transition focus:outline-none focus:border-ink focus:ring-2 focus:ring-accent-glow"
      {...rest}
    />
  </label>
);

const PaymentOption = ({ value, method, setMethod, title, description, children }) => {
  const selected = method === value;
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={() => setMethod(value)}
      className={`w-full flex items-center gap-3.5 rounded-xl border p-4 text-left transition cursor-pointer ${
        selected ? "border-ink bg-surface shadow-sm" : "border-hairline bg-surface/60 hover:border-ink-faint"
      }`}
    >
      <span
        className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border-2 ${
          selected ? "border-ink" : "border-ink-faint"
        }`}
      >
        {selected && <span className="h-2 w-2 rounded-full bg-ink" />}
      </span>
      <span className="flex-1 min-w-0">
        <span className="flex items-center gap-2 text-sm font-semibold text-ink">{children || title}</span>
        <span className="block text-xs text-ink-muted mt-0.5">{description}</span>
      </span>
    </button>
  );
};

export default function PlaceOrder() {
  const {
    navigate,
    backendUrl,
    token,
    cartItems,
    setCartItems,
    products,
    currency,
  } = useShopContext();
  const [method, setMethod] = useState("cod");
  const [submitting, setSubmitting] = useState(false);

  // One idempotency key per cart contents: a retry or double click returns the same order instead of a duplicate
  const cartSignature = JSON.stringify(cartItems);
  const idempotencyKey = useMemo(
    () => (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cartSignature]
  );
  const cartIsEmpty = Object.values(cartItems).every((sizes) => Object.values(sizes || {}).every((q) => !(q > 0)));
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const formDataRef = useRef(formData);
  formDataRef.current = formData;

  // Addresses from the shopper's past orders, newest first and de-duplicated
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressKey, setSelectedAddressKey] = useState(null);
  const [prefillSource, setPrefillSource] = useState(null); // 'order' | 'profile' | null

  useEffect(() => {
    if (!token || !backendUrl) return;
    let cancelled = false;

    const loadPrefill = async () => {
      try {
        const res = await axios.post(backendUrl + "/api/v1/order/userorders", {}, { headers: { token } });
        const orders = res.data?.success && Array.isArray(res.data.data) ? res.data.data : [];
        const seen = new Set();
        const addresses = [];
        for (const order of orders) {
          const address = toFormAddress(order.shippingAddress || order.address);
          if (!address.street || !address.phone) continue;
          const key = addressKey(address);
          if (seen.has(key)) continue;
          seen.add(key);
          addresses.push({ key, address });
          if (addresses.length >= 3) break;
        }
        if (cancelled) return;

        if (addresses.length > 0) {
          setSavedAddresses(addresses);
          // Never overwrite what the shopper has already started typing
          if (isFormEmpty(formDataRef.current)) {
            setFormData(addresses[0].address);
            setSelectedAddressKey(addresses[0].key);
            setPrefillSource("order");
          }
          return;
        }
      } catch {
        // No order history available; fall back to the profile below
      }

      try {
        const res = await axios.get(backendUrl + "/api/v1/user/profile", { headers: { token } });
        const user = res.data?.data;
        if (cancelled || !user) return;
        const [firstName = "", ...rest] = String(user.name || "").trim().split(/\s+/);
        if (isFormEmpty(formDataRef.current)) {
          setFormData({ ...EMPTY_FORM, firstName, lastName: rest.join(" "), email: user.email || "" });
          setPrefillSource("profile");
        }
      } catch {
        // Profile unavailable; the shopper fills the form manually
      }
    };

    loadPrefill();
    return () => {
      cancelled = true;
    };
  }, [backendUrl, token]);

  const onChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;

    setFormData((data) => ({ ...data, [name]: value }));
    setSelectedAddressKey(null);
  };

  const selectSavedAddress = (entry) => {
    setFormData(entry.address);
    setSelectedAddressKey(entry.key);
    setPrefillSource("order");
  };

  const clearForm = () => {
    setFormData(EMPTY_FORM);
    setSelectedAddressKey(null);
    setPrefillSource(null);
  };

  // Lines shown in the order summary
  const summaryLines = useMemo(() => {
    const lines = [];
    for (const productId in cartItems) {
      const product = products.find((p) => p._id === productId);
      if (!product) continue;
      for (const label in cartItems[productId]) {
        const quantity = cartItems[productId][label];
        if (!(quantity > 0)) continue;
        lines.push({
          key: `${productId}-${label}`,
          name: product.name,
          label,
          quantity,
          image: getVariantImage(product, label),
          lineTotal: getUnitPrice(product, label) * quantity,
        });
      }
    }
    return lines;
  }, [cartItems, products]);

  const itemCount = summaryLines.reduce((sum, line) => sum + line.quantity, 0);

  const handleApplyCoupon = async (e) => {
    if (e) e.preventDefault();
    const cleanCode = couponCode.trim().toUpperCase();
    if (!cleanCode) {
      toast.error("Please enter a coupon code");
      return;
    }
    if (!token) {
      toast.error("Please login to apply coupon code");
      return;
    }

    try {
      setCouponLoading(true);
      const res = await axios.post(
        backendUrl + "/api/v1/order/validate-coupon",
        { coupon: cleanCode },
        { headers: { token } }
      );

      if (res.data.success) {
        setAppliedCoupon(res.data.data);
        toast.success(res.data.message || "Coupon applied successfully!");
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || "Invalid coupon code"
      );
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast.info("Coupon removed");
  };

  const initPay = (orderPayload) => {
    const gateway = orderPayload?.gatewayData || {};
    const orderObj = orderPayload?.order || {};

    const razorpayOrderId = orderPayload?.id || gateway.id;
    const razorpayAmount = orderPayload?.amount || gateway.amount || (orderObj.grandTotal ? Math.round(orderObj.grandTotal * 100) : 0);
    const razorpayCurrency = orderPayload?.currency || gateway.currency || "USD";
    const receipt = orderPayload?.receipt || gateway.receipt || orderObj.orderNumber;
    const internalOrderId = orderObj._id || orderPayload?.orderId || "";

    const razorpayKey =
      gateway.key ||
      orderPayload?.key ||
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

    if (!razorpayKey || !razorpayOrderId) {
      toast.error("Online payment isn't configured right now. Please choose Cash on Delivery.");
      return;
    }

    const openCheckout = () => {
      const options = {
        key: razorpayKey,
        amount: razorpayAmount,
        currency: razorpayCurrency,
        name: "Vellora Marketplace",
        description: "Payment for Order " + (receipt || ""),
        order_id: razorpayOrderId,
        receipt: receipt,
        modal: {
          ondismiss: () => {
            toast.info("Payment not completed. Your order is saved; press Complete Order again to pay.");
          },
        },
        handler: async (response) => {
          try {
            const verifyPayload = {
              ...response,
              orderId: internalOrderId,
            };
            const res = await axios.post(
              backendUrl + "/api/v1/order/verifyRazorpay",
              verifyPayload,
              { headers: { token } },
            );
            if (res.data.success) {
              if (typeof window !== "undefined") {
                localStorage.removeItem("vellora_cart");
              }
              setCartItems({});
              toast.success("Payment verified! Order placed successfully.");
              navigate("/orders");
            } else {
              toast.error(res.data.message || "Payment verification failed");
            }
          } catch (error) {
            toast.error(
              error.response?.data?.message ||
                error.message ||
                "Payment verification error",
            );
          }
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: "#1C1917",
        },
      };

      try {
        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", function (response) {
          toast.error("Payment failed: " + (response.error?.description || "Transaction declined"));
        });
        rzp.open();
      } catch (err) {
        toast.error("Failed to launch Razorpay gateway: " + err.message);
      }
    };

    if (typeof window !== "undefined" && window.Razorpay) {
      openCheckout();
    } else {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => {
        openCheckout();
      };
      script.onerror = () => {
        toast.error("Razorpay SDK failed to load. Please check your internet connection.");
      };
      document.body.appendChild(script);
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      if (!token) {
        toast.error("Please login to place an order");
        navigate("/login");
        return;
      }

      let orderItems = [];

      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            const foundProduct = products.find((product) => product._id === items);
            if (foundProduct) {
              // Only identifiers and quantity — the server prices every line from the catalog
              orderItems.push({
                productId: foundProduct._id,
                name: foundProduct.name,
                size: item,
                quantity: cartItems[items][item],
                stock: foundProduct.stock,
              });
            }
          }
        }
      }

      if (orderItems.length === 0) {
        toast.error("Your cart is empty");
        return;
      }

      // Pre-check inventory availability on checkout
      for (const item of orderItems) {
        if (item.stock !== undefined && item.stock < item.quantity) {
          toast.error(`"${item.name}" has only ${item.stock} available in stock. Please adjust your quantity.`);
          return;
        }
      }

      let orderData = {
        address: formData,
        items: orderItems.map(({ productId, size, quantity }) => ({ productId, size, quantity })),
        idempotencyKey,
        ...(appliedCoupon && { coupon: appliedCoupon.code }),
      };
      const requestConfig = { headers: { token, "Idempotency-Key": idempotencyKey } };

      switch (method) {
        case "cod": {
          const res = await axios.post(
            backendUrl + "/api/v1/order/place",
            orderData,
            requestConfig,
          );
          if (res.data.success) {
            if (typeof window !== "undefined") {
              localStorage.removeItem("vellora_cart");
            }
            setCartItems({});
            toast.success(res.data.message);
            navigate("/orders");
          } else {
            toast.error(res.data.message);
          }
          break;
        }

        case "razorpay": {
          const resRazorpay = await axios.post(
            backendUrl + "/api/v1/order/razorpay",
            orderData,
            requestConfig,
          );

          if (resRazorpay.data.success) {
            initPay(resRazorpay.data.data);
          } else {
            toast.error(resRazorpay.data.message);
          }
          break;
        }

        default:
          break;
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Something went wrong",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (cartIsEmpty) {
    return (
      <div className="border-t pt-14 py-20 text-center">
        <p className="font-serif text-xl text-stone-900 mb-2">Your bag is empty</p>
        <p className="text-sm text-stone-500 mb-6">Add something to your bag before checking out.</p>
        <Link href="/collection" className="luxury-btn-primary inline-block px-8 py-3">Continue shopping</Link>
      </div>
    );
  }

  const steps = ["Bag", "Delivery", "Payment"];

  return (
    <form onSubmit={onSubmitHandler} className="border-t pt-6 sm:pt-10 pb-16 min-h-[80vh]">
      {/* ----------- Checkout progress ----------- */}
      <div className="flex items-center justify-between gap-4 flex-wrap mb-8">
        <div className="text-xl sm:text-2xl">
          <Title text1={"SECURE"} text2={"CHECKOUT"} />
        </div>
        <ol className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em]">
          {steps.map((step, i) => (
            <li key={step} className="flex items-center gap-2">
              {i === 0 ? (
                <Link href="/cart" className="flex items-center gap-1.5 text-ink-muted hover:text-ink transition">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ink text-white text-[10px]">✓</span>
                  {step}
                </Link>
              ) : (
                <span className="flex items-center gap-1.5 text-ink">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border border-ink text-[10px]">{i + 1}</span>
                  {step}
                </span>
              )}
              {i < steps.length - 1 && <span className="w-6 sm:w-10 h-px bg-hairline" />}
            </li>
          ))}
        </ol>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8 lg:gap-12 items-start">
        {/* -----------Left Side: Delivery details------------- */}
        <div className="space-y-6">
          {/* Saved addresses from past orders */}
          {savedAddresses.length > 0 && (
            <section className="bg-surface border border-hairline rounded-2xl p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="font-serif text-lg text-ink">Saved addresses</h2>
                  <p className="text-xs text-ink-muted mt-0.5">From your previous orders. Pick one to fill the form.</p>
                </div>
                <button
                  type="button"
                  onClick={clearForm}
                  className="text-xs font-semibold text-ink-secondary underline underline-offset-4 hover:text-ink cursor-pointer shrink-0"
                >
                  Use a new address
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {savedAddresses.map((entry, i) => {
                  const a = entry.address;
                  const selected = selectedAddressKey === entry.key;
                  return (
                    <button
                      key={entry.key}
                      type="button"
                      onClick={() => selectSavedAddress(entry)}
                      aria-pressed={selected}
                      className={`relative text-left rounded-xl border p-4 transition cursor-pointer ${
                        selected ? "border-ink bg-canvas-subtle shadow-sm" : "border-hairline hover:border-ink-faint"
                      }`}
                    >
                      {i === 0 && (
                        <span className="absolute top-3 right-3 text-[9px] font-semibold uppercase tracking-wider text-accent bg-accent-light px-2 py-0.5 rounded-full">
                          Last used
                        </span>
                      )}
                      <p className="text-sm font-semibold text-ink pr-16">{a.firstName} {a.lastName}</p>
                      <p className="text-xs text-ink-secondary mt-1 leading-relaxed">
                        {a.street}, {a.city}, {a.state} {a.zipcode}, {a.country}
                      </p>
                      <p className="text-xs text-ink-muted mt-1">{a.phone}</p>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          <section className="bg-surface border border-hairline rounded-2xl p-5 sm:p-6 space-y-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-serif text-lg text-ink">Delivery information</h2>
                <p className="text-xs text-ink-muted mt-0.5">Where should we send your order?</p>
              </div>
              {prefillSource && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-status-success bg-status-success-bg border border-status-success-border px-2.5 py-1 rounded-full shrink-0">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  {prefillSource === "order" ? "Filled from your orders" : "Filled from your profile"}
                </span>
              )}
            </div>

            <div className="space-y-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">Contact</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="First name" name="firstName" value={formData.firstName} onChange={onChangeHandler} autoComplete="given-name" />
                <Field label="Last name" name="lastName" value={formData.lastName} onChange={onChangeHandler} autoComplete="family-name" />
                <Field label="Email address" name="email" type="email" value={formData.email} onChange={onChangeHandler} autoComplete="email" />
                <Field label="Phone" name="phone" type="tel" value={formData.phone} onChange={onChangeHandler} autoComplete="tel" inputMode="tel" />
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">Shipping address</p>
              <Field label="Street address" name="street" value={formData.street} onChange={onChangeHandler} autoComplete="street-address" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="City" name="city" value={formData.city} onChange={onChangeHandler} autoComplete="address-level2" />
                <Field label="State" name="state" value={formData.state} onChange={onChangeHandler} autoComplete="address-level1" />
                <Field label="Zip code" name="zipcode" value={formData.zipcode} onChange={onChangeHandler} autoComplete="postal-code" inputMode="numeric" />
                <Field label="Country" name="country" value={formData.country} onChange={onChangeHandler} autoComplete="country-name" />
              </div>
            </div>
          </section>

          {/* ----------Payment Method Selection------- */}
          <section className="bg-surface border border-hairline rounded-2xl p-5 sm:p-6">
            <h2 className="font-serif text-lg text-ink">Payment method</h2>
            <p className="text-xs text-ink-muted mt-0.5 mb-4">All transactions are secure and encrypted.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Payment method">
              <PaymentOption
                value="razorpay"
                method={method}
                setMethod={setMethod}
                description="UPI, cards, net banking & wallets"
              >
                <img className="h-5" src={getImageSrc(assets.razorpay_logo)} alt="Razorpay" />
              </PaymentOption>
              <PaymentOption
                value="cod"
                method={method}
                setMethod={setMethod}
                title="Cash on delivery"
                description="Pay when your order arrives"
              />
            </div>
          </section>
        </div>

        {/* -------------Right Side: Order summary---------- */}
        <aside className="lg:sticky lg:top-28 space-y-5">
          <div className="bg-surface border border-hairline rounded-2xl p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg text-ink">Order summary</h2>
              <Link href="/cart" className="text-xs font-semibold text-ink-secondary underline underline-offset-4 hover:text-ink">
                Edit bag
              </Link>
            </div>

            <ul className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {summaryLines.map((line) => (
                <li key={line.key} className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    {line.image ? (
                      <img src={line.image} alt={line.name} className="w-14 h-14 rounded-lg object-cover border border-hairline" />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-canvas-muted border border-hairline" />
                    )}
                    <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-ink text-white text-[10px] font-semibold flex items-center justify-center">
                      {line.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-ink truncate">{line.name}</p>
                    <p className="text-xs text-ink-muted">{line.label}</p>
                  </div>
                  <p className="text-sm font-medium text-ink">{formatMoney(line.lineTotal, currency)}</p>
                </li>
              ))}
            </ul>

            {/* ----------- Coupon Section ----------- */}
            <div className="border-t border-hairline pt-5">
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-status-success-bg border border-status-success-border rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-status-success">
                        {appliedCoupon.code} applied
                      </p>
                      <p className="text-[11px] text-status-success/80">{appliedCoupon.message}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-xs font-semibold text-red-600 hover:text-red-800 transition cursor-pointer px-2 py-1"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Discount code"
                      aria-label="Discount code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleApplyCoupon(e);
                      }}
                      className="flex-1 min-w-0 bg-surface border border-hairline rounded-lg px-3.5 py-2.5 text-sm uppercase tracking-wide focus:border-ink focus:outline-none"
                    />
                    <button
                      type="button"
                      disabled={couponLoading || !couponCode.trim()}
                      onClick={handleApplyCoupon}
                      className="bg-ink hover:bg-ink-secondary text-white text-xs font-semibold tracking-wider px-5 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {couponLoading ? "Applying…" : "APPLY"}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCouponCode("FIRST")}
                    className="mt-2.5 text-[11px] text-ink-muted hover:text-ink transition cursor-pointer"
                  >
                    New customer? Use <span className="font-semibold text-status-success">FIRST</span> for free delivery
                  </button>
                </div>
              )}
            </div>

            <div className="border-t border-hairline pt-5">
              <CartTotal coupon={appliedCoupon} showTitle={false} />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="luxury-btn-primary w-full py-4 disabled:opacity-60 disabled:cursor-wait"
            >
              {submitting
                ? "PLACING ORDER…"
                : method === "razorpay"
                  ? "PAY & COMPLETE ORDER"
                  : "COMPLETE ORDER"}
            </button>

            <p className="flex items-center justify-center gap-1.5 text-[11px] text-ink-muted">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Secure checkout · {itemCount} {itemCount === 1 ? "item" : "items"}
            </p>
          </div>
        </aside>
      </div>
    </form>
  );
}

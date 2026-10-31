'use client';

import React, { useMemo } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { useShopContext } from "../../context/ShopContext";
import Title from "../../components/Title";
import { assets } from "../../assets/assets";
import CartTotal from "../../components/CartTotal";
import { handleImageError, PLACEHOLDER_IMAGE } from "../../components/ui/imageFallback";
import {
  getUnitPrice,
  getVariantListPrice,
  getVariantStock,
  getVariantLabelError,
  getDiscountPercent,
  getVariantImage,
  formatPrice,
} from "../../utils/pricing";

const getImageSrc = (img) => (typeof img === "object" && img?.src ? img.src : img);

export default function Cart() {
  const { products, productsLoading, currency, cartItems, updateQuantity, navigate } =
    useShopContext();

  const cartLines = useMemo(() => {
    const lines = [];
    for (const itemId in cartItems) {
      for (const label in cartItems[itemId]) {
        const quantity = cartItems[itemId][label];
        if (quantity > 0) {
          const product = products.find((p) => p._id === itemId) || null;
          lines.push({ itemId, label, quantity, product });
        }
      }
    }
    return lines;
  }, [cartItems, products]);

  // Lines that can't be checked out (removed product, option no longer offered, not enough stock)
  const lineProblem = (line) => {
    if (!line.product) return "This product is no longer available";
    const optionError = getVariantLabelError(line.product, line.label);
    if (optionError) return "This option is no longer offered — please remove it and choose again";
    const stock = getVariantStock(line.product, line.label);
    if (stock <= 0) return "Out of stock";
    if (line.quantity > stock) return `Only ${stock} available — please lower the quantity`;
    return null;
  };

  const hasProblems = !productsLoading && cartLines.some((line) => lineProblem(line));

  const changeQuantity = (line, nextQty) => {
    if (!Number.isFinite(nextQty) || nextQty < 1) return;
    const stock = getVariantStock(line.product, line.label);
    if (nextQty > stock) {
      toast.warn(`Only ${stock} units available in stock`);
      return;
    }
    updateQuantity(line.itemId, line.label, Math.floor(nextQty));
  };

  if (cartLines.length === 0) {
    return (
      <div className="border-t pt-14">
        <div className="text-2xl mb-3">
          <Title text1={"YOUR"} text2={"CART"} />
        </div>
        <div className="py-20 text-center">
          <p className="font-serif text-xl text-stone-900 mb-2">Your bag is empty</p>
          <p className="text-sm text-stone-500 mb-6">Browse the collection and add something you love.</p>
          <Link href="/collection" className="luxury-btn-primary inline-block px-8 py-3">Continue shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t pt-14">
      <div className="text-2xl mb-3">
        <Title text1={"YOUR"} text2={"CART"} />
      </div>
      <div>
        {cartLines.map((line) => {
          const { product } = line;
          const key = `${line.itemId}::${line.label}`;

          if (!product) {
            return productsLoading ? null : (
              <div key={key} className="py-4 border-t border-b text-gray-700 flex items-center justify-between gap-4">
                <p className="text-sm text-red-700">An item in your bag is no longer available.</p>
                <button
                  type="button"
                  onClick={() => updateQuantity(line.itemId, line.label, 0)}
                  className="text-xs font-semibold text-red-700 underline cursor-pointer"
                >
                  Remove
                </button>
              </div>
            );
          }

          // Photo of the option in the bag (e.g. the Sage Green one), else the main photo
          const imgSrc = getVariantImage(product, line.label) || PLACEHOLDER_IMAGE;
          const unitPrice = getUnitPrice(product, line.label);
          const listPrice = getVariantListPrice(product, line.label);
          const discount = getDiscountPercent(product);
          const stock = getVariantStock(product, line.label);
          const problem = lineProblem(line);

          return (
            <div
              key={key}
              className="py-4 border-t border-b text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4"
            >
              <div className="flex items-start gap-6">
                <Link href={`/product/${product._id}`} className="shrink-0">
                  <img onError={handleImageError}
                    className="w-16 sm:w-20 object-cover"
                    src={imgSrc}
                    alt={product.name}
                  />
                </Link>
                <div>
                  <Link href={`/product/${product._id}`} className="text-xs sm:text-lg font-medium hover:underline">
                    {product.name}
                  </Link>
                  <div className="flex items-center gap-x-5 gap-y-2 mt-2 flex-wrap">
                    {discount > 0 ? (
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-red-600">{formatPrice(unitPrice, currency)}</p>
                        <p className="text-xs text-gray-400 line-through">{formatPrice(listPrice, currency)}</p>
                        <span className="text-[10px] bg-red-100 text-red-700 font-semibold px-1.5 py-0.5 rounded">
                          {discount}% OFF
                        </span>
                      </div>
                    ) : (
                      <p>{formatPrice(unitPrice, currency)}</p>
                    )}
                    {line.label !== "Standard" && (
                      <p className="px-2 sm:px-3 sm:py-1 border bg-slate-50 text-xs sm:text-sm">{line.label}</p>
                    )}
                    {!problem && stock <= 5 && (
                      <span className="text-[11px] font-medium text-amber-700">Only {stock} left</span>
                    )}
                  </div>
                  {problem && <p className="mt-2 text-xs font-semibold text-red-700">{problem}</p>}
                  {line.quantity > 1 && (
                    <p className="mt-1 text-xs text-stone-500">
                      Line total: {formatPrice(unitPrice * line.quantity, currency)}
                    </p>
                  )}
                </div>
              </div>

              {/* Quantity stepper — always reflects the cart, never goes below 1 (use Remove instead) */}
              <div className="flex items-center border w-fit">
                <button
                  type="button"
                  aria-label={`Decrease quantity of ${product.name}`}
                  disabled={line.quantity <= 1}
                  onClick={() => changeQuantity(line, line.quantity - 1)}
                  className="px-2 sm:px-3 py-1 text-sm disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                >
                  −
                </button>
                <span className="px-2 sm:px-3 py-1 text-sm min-w-8 text-center" aria-live="polite">
                  {line.quantity}
                </span>
                <button
                  type="button"
                  aria-label={`Increase quantity of ${product.name}`}
                  disabled={line.quantity >= stock}
                  onClick={() => changeQuantity(line, line.quantity + 1)}
                  className="px-2 sm:px-3 py-1 text-sm disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={() => updateQuantity(line.itemId, line.label, 0)}
                className="w-fit mr-4 cursor-pointer"
                aria-label={`Remove ${product.name} from cart`}
              >
                <img src={getImageSrc(assets.bin_icon)} className="w-4 sm:w-5" alt="" />
              </button>
            </div>
          );
        })}
      </div>
      <div className="flex justify-end my-20">
        <div className="w-full sm:w-112.5">
          <CartTotal />
          <div className="w-full text-end">
            {hasProblems && (
              <p className="mt-6 text-xs text-red-700">Please fix the items marked above before checking out.</p>
            )}
            <button
              type="button"
              disabled={hasProblems || productsLoading}
              onClick={() => navigate("/place-order")}
              className="luxury-btn-primary my-8 px-10 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              PROCEED TO CHECKOUT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

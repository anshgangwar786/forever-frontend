'use client';

import React, { useState } from 'react';
import { useShopContext } from '../context/ShopContext';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { handleImageError, PLACEHOLDER_IMAGE } from "./ui/imageFallback";
import {
  hasVariantChoices,
  getAttributes,
  buildVariantLabel,
  getStartingPrice,
  getStartingListPrice,
  hasRemainingPriceVariation,
  getDiscountPercent,
  getCardAttribute,
  getImageForSelection,
  getImageList,
  getVariantStock,
  formatPrice,
} from "../utils/pricing";

const MAX_CARD_OPTIONS = 4;

const ProductItem = ({ id, image, name, price, discount = 0, bestseller = false, sizes = [], stock }) => {
  const { currency, addToCart, products, navigate } = useShopContext();
  const [adding, setAdding] = useState(false);
  // Option picked on the card (e.g. { Color: "Sage Green" }); drives photo, price and quick add
  const [selected, setSelected] = useState({});

  // Full record carries options, per-option prices and photos; fall back to the props for safety
  const product = products.find((p) => p._id === id) || { _id: id, name, price, discount, sizes, stock, image, attributes: [] };

  const imagesArray = getImageList(product);
  const hasSelection = Object.keys(selected).length > 0;
  const primaryImg = (hasSelection ? getImageForSelection(product, selected) : imagesArray[0]) || PLACEHOLDER_IMAGE;
  const secondaryImg = !hasSelection && imagesArray.length > 1 ? imagesArray[1] : null;

  const attributes = getAttributes(product);
  const cardAttribute = getCardAttribute(product);
  const numDiscount = getDiscountPercent(product);
  const hasDiscount = numDiscount > 0;
  const variesInPrice = hasRemainingPriceVariation(product, selected);
  const displayPrice = getStartingPrice(product, selected);
  const listPrice = getStartingListPrice(product, selected);
  const isOutOfStock = stock !== undefined && Number(stock) <= 0;
  const needsChoice = hasVariantChoices(product);
  // The card can add straight to the bag once every option is chosen
  const selectionComplete = needsChoice && attributes.every((a) => selected[a.name] !== undefined);
  const selectedLabel = selectionComplete ? buildVariantLabel(product, selected) : null;
  const selectedSoldOut = selectedLabel !== null && getVariantStock(product, selectedLabel) <= 0;
  const showSoldOut = isOutOfStock || selectedSoldOut;

  // Carry the card's choice over to the product page
  const productHref = hasSelection ? `/product/${id}?${new URLSearchParams(selected).toString()}` : `/product/${id}`;

  const toggleOption = (attrName, value) => {
    setSelected((prev) => (prev[attrName] === value ? {} : { [attrName]: value }));
  };

  const handleQuickAdd = async () => {
    if (showSoldOut || adding) return;

    // Products with options still to choose (size, color, …) send the shopper to pick them
    if (needsChoice && !selectionComplete) {
      navigate(productHref);
      return;
    }

    setAdding(true);
    const added = await addToCart(id, selectedLabel ?? 'Standard');
    if (added) {
      toast.success(`Added ${name}${selectedLabel ? ` (${selectedLabel})` : ''} to Cart`, { icon: '🛒' });
    }
    setTimeout(() => setAdding(false), 600);
  };

  return (
    <div className="group text-stone-800">
      <div className="relative">
      <Link
        href={productHref}
        className="block cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 rounded-xs"
        aria-label={`View ${name}`}
      >
        {/* Image Container with Micro-Interactions */}
        <div className="relative overflow-hidden rounded-xs bg-[#F4F1EA] aspect-3/4 border border-stone-200/60">
          {/* Primary Image — the chosen option's photo once one is picked */}
          <img onError={handleImageError}
            src={primaryImg}
            alt={name || 'E-Commerce Product'}
            className={`w-full h-full object-cover object-top transition-all duration-700 ease-out group-hover:scale-105 ${
              secondaryImg ? 'group-hover:opacity-0' : ''
            }`}
            loading="lazy"
          />

          {/* Secondary Image for Smooth Hover Swap */}
          {secondaryImg && (
            <img onError={handleImageError}
              src={secondaryImg}
              alt={`${name || 'Item'} alternate perspective`}
              className="absolute inset-0 w-full h-full object-cover object-top opacity-0 transition-all duration-700 ease-out group-hover:opacity-100 group-hover:scale-105"
              loading="lazy"
            />
          )}

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10 pointer-events-none">
            {showSoldOut ? (
              <span className="bg-red-700 text-white text-[9px] uppercase tracking-[0.15em] font-bold px-2 py-0.5 rounded-xs shadow-xs">
                Sold Out
              </span>
            ) : (
              <>
                {hasDiscount && (
                  <span className="bg-stone-900 text-white text-[9px] uppercase tracking-[0.15em] font-semibold px-2 py-0.5 rounded-xs shadow-xs">
                    {numDiscount}% OFF
                  </span>
                )}
                {bestseller && (
                  <span className="bg-white/95 backdrop-blur-xs text-stone-900 text-[9px] uppercase tracking-[0.15em] font-medium px-2 py-0.5 rounded-xs shadow-xs border border-stone-200">
                    Bestseller
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </Link>

      {/* Quick Add — a sibling of the link (not nested in it); visible on hover, keyboard focus and touch screens */}
      <div className="absolute inset-x-3 bottom-3 z-20 transition-all duration-300 ease-out opacity-100 translate-y-0 pointer-fine:opacity-0 pointer-fine:translate-y-3 pointer-fine:group-hover:opacity-100 pointer-fine:group-hover:translate-y-0 pointer-fine:focus-within:opacity-100 pointer-fine:focus-within:translate-y-0">
        <button
          type="button"
          onClick={handleQuickAdd}
          disabled={adding || showSoldOut}
          className={`w-full text-[10px] uppercase tracking-[0.2em] font-semibold py-2.5 px-3 rounded-xs shadow-md transition-colors duration-200 border flex items-center justify-center gap-1.5 backdrop-blur-xs ${
            showSoldOut
              ? "bg-stone-200/90 text-stone-500 border-stone-300 cursor-not-allowed"
              : "bg-white/95 hover:bg-stone-900 hover:text-white text-stone-900 border-stone-200 cursor-pointer"
          }`}
          aria-label={
            showSoldOut
              ? `${name} is sold out`
              : needsChoice && !selectionComplete
                ? `Choose options for ${name}`
                : `Quick add ${name} to shopping bag`
          }
        >
          {showSoldOut ? (
            <span>Sold Out</span>
          ) : adding ? (
            <span className="inline-flex items-center gap-1">
              <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Added
            </span>
          ) : needsChoice && !selectionComplete ? (
            <span>Choose Options</span>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M12 4v16m8-8H4" />
              </svg>
              Quick Add
            </>
          )}
        </button>
      </div>
      </div>

      {/* Option chips — picking one swaps the card's photo and price */}
      {cardAttribute && (
        <div className="pt-3 flex flex-wrap items-center gap-1.5" role="radiogroup" aria-label={`${name} ${cardAttribute.name}`}>
          {cardAttribute.values.slice(0, MAX_CARD_OPTIONS).map((val) => {
            const isSelected = selected[cardAttribute.name] === val;
            return (
              <button
                type="button"
                key={val}
                role="radio"
                aria-checked={isSelected}
                onClick={() => toggleOption(cardAttribute.name, val)}
                title={`${cardAttribute.name}: ${val}`}
                className={`max-w-28 truncate text-[10px] tracking-wide px-2 py-0.5 rounded-xs border transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-stone-900 text-white border-stone-900"
                    : "bg-white text-stone-600 border-stone-300 hover:border-stone-900"
                }`}
              >
                {val}
              </button>
            );
          })}
          {cardAttribute.values.length > MAX_CARD_OPTIONS && (
            <Link href={productHref} className="text-[10px] text-stone-500 hover:text-stone-900 hover:underline">
              +{cardAttribute.values.length - MAX_CARD_OPTIONS} more
            </Link>
          )}
        </div>
      )}

      <Link href={productHref} tabIndex={-1} className="block">
        {/* Product Typography & Pricing */}
        <div className={`${cardAttribute ? 'pt-2' : 'pt-3'} pb-1`}>
          <h3 className="font-serif text-sm text-stone-800 group-hover:text-stone-950 transition-colors line-clamp-1 tracking-wide">
            {name}
          </h3>
          <div className="mt-1 flex items-baseline gap-2">
            {variesInPrice && <span className="text-[11px] text-stone-500">From</span>}
            <span className={`text-sm ${hasDiscount ? 'font-semibold text-stone-950' : 'font-medium text-stone-800'}`}>
              {formatPrice(displayPrice, currency)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-stone-400 line-through font-normal">
                {formatPrice(listPrice, currency)}
              </span>
            )}
          </div>
        </div>
      </Link>

    </div>
  );
};

export default ProductItem;

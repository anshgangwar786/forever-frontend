'use client';

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";
import { useShopContext } from "../../../context/ShopContext";
import RelatedProducts from "../../../components/RelatedProducts";
import ReviewsSection, { StarRating } from "../../../components/ReviewsSection";
import ImageZoom from "../../../components/ImageZoom";
import { handleImageError } from "../../../components/ui/imageFallback";
import {
  getAttributes,
  buildVariantLabel,
  getUnitPrice,
  getVariantListPrice,
  getVariantStock,
  getPriceDelta,
  getDiscountPercent,
  formatPrice,
  getImageSrc,
  getVariantImageLinks,
  getImageForSelection,
} from "../../../utils/pricing";

// Options chosen on a product card arrive as query params, e.g. ?Color=Sage%20Green
const getRequestedOptions = () => {
  if (typeof window === "undefined") return {};
  return Object.fromEntries(new URLSearchParams(window.location.search).entries());
};

export default function Product() {
  const { productId } = useParams();
  const { products, productsLoading, currency, delivery_fee, addToCart } = useShopContext();
  const [productData, setProductData] = useState(null);
  const [image, setImage] = useState("");
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [adding, setAdding] = useState(false);
  const [ratingStats, setRatingStats] = useState({ averageRating: 0, totalReviews: 0 });

  const fetchProductData = useCallback(() => {
    const item = products.find((p) => p._id === productId);
    if (!item) {
      setProductData(null);
      return;
    }
    setProductData(item);
    setRatingStats({
      averageRating: item.ratingAverage || 0,
      totalReviews: item.ratingCount || 0
    });

    // Pre-select the option requested from a product card, else the first in-stock option of each attribute
    const requested = getRequestedOptions();
    const initialAttrs = {};
    getAttributes(item).forEach((attr) => {
      if (attr.values.includes(requested[attr.name])) {
        initialAttrs[attr.name] = requested[attr.name];
        return;
      }
      const firstAvailable = attr.values.find((v) => {
        const label = buildVariantLabel(item, { ...initialAttrs, [attr.name]: v });
        return getVariantStock(item, label) > 0;
      });
      initialAttrs[attr.name] = firstAvailable ?? attr.values[0];
    });
    setSelectedAttributes(initialAttrs);

    // Open on the photo of the pre-selected options, if one is linked
    setImage(getImageForSelection(item, initialAttrs));
  }, [productId, products]);

  const handleRatingUpdate = useCallback((avg, count) => {
    setRatingStats({ averageRating: avg, totalReviews: count });
  }, []);

  useEffect(() => {
    fetchProductData();
  }, [fetchProductData]);

  const imageList = productData
    ? Array.isArray(productData.image)
      ? productData.image
      : [productData.image]
    : [];

  const variantImageLinks = productData ? getVariantImageLinks(productData) : [];

  const selectAttribute = (attrName, val) => {
    setSelectedAttributes((prev) => ({ ...prev, [attrName]: val }));
    const link = variantImageLinks.find((l) => l.attribute === attrName && l.value === val);
    if (link) setImage(link.image);
  };

  const selectThumbnail = (src) => {
    setImage(src);
    // Keep the selected option in sync with the photo it belongs to
    const link = variantImageLinks.find((l) => l.image === src);
    if (link) {
      setSelectedAttributes((prev) => ({ ...prev, [link.attribute]: link.value }));
    }
  };

  const attributes = productData ? getAttributes(productData) : [];
  const variantLabel = productData ? buildVariantLabel(productData, selectedAttributes) : "";
  const numDiscount = productData ? getDiscountPercent(productData) : 0;
  const hasDiscount = numDiscount > 0;
  const listPrice = productData ? getVariantListPrice(productData, variantLabel) : 0;
  const unitPrice = productData ? getUnitPrice(productData, variantLabel) : 0;
  const selectedStock = productData ? getVariantStock(productData, variantLabel) : 0;
  const isSelectedOutOfStock = selectedStock <= 0;

  const handleAddToCart = async () => {
    if (adding || isSelectedOutOfStock) return;
    setAdding(true);
    const added = await addToCart(productData._id, variantLabel);
    if (added) toast.success(`Added ${productData.name} to your bag`);
    setAdding(false);
  };

  if (!productData) {
    return productsLoading ? (
      <div className="py-24 text-center text-stone-400 font-serif text-lg">Loading product details...</div>
    ) : (
      <div className="py-24 text-center">
        <p className="font-serif text-2xl text-stone-900 mb-2">Product not found</p>
        <p className="text-sm text-stone-500 mb-6">This item may have been removed or the link is incorrect.</p>
        <Link href="/collection" className="luxury-btn-primary inline-block px-8 py-3">Browse the collection</Link>
      </div>
    );
  }

  return (
    <div className="pt-6 sm:pt-10 transition-opacity ease-in duration-500 opacity-100">
      {/* Product Presentation Grid */}
      <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
        {/* Images Column */}
        <div className="w-full lg:w-3/5 flex flex-col-reverse sm:flex-row gap-4 items-start">
          {/* Thumbnails */}
          {imageList.length > 1 && (
            <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto sm:w-24 shrink-0 w-full pb-2 sm:pb-0">
              {imageList.map((item, index) => {
                const currentSrc = getImageSrc(item);
                const isSelected = image === currentSrc;
                return (
                  <button
                    type="button"
                    key={index}
                    onClick={() => selectThumbnail(currentSrc)}
                    className={`w-18 sm:w-20 aspect-3/4 rounded-xs overflow-hidden border transition-all cursor-pointer focus:outline-none ${
                      isSelected
                        ? "border-stone-900 ring-1 ring-stone-900"
                        : "border-stone-200 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img onError={handleImageError}
                      src={currentSrc}
                      className="w-full h-full object-cover object-top"
                      alt={`${productData.name} thumb ${index + 1}`}
                    />
                  </button>
                );
              })}
            </div>
          )}

          {/* Main Zoomable Hero Image */}
          <div className="flex-1 w-full bg-[#F4F1EA] rounded-xs border border-stone-200/90 overflow-hidden">
            <ImageZoom
              src={image}
              alt={productData.name}
              zoomScale={2.2}
              showHint={true}
              enableLightbox={true}
            />
          </div>
        </div>

        {/* Product Details Column */}
        <div className="w-full lg:w-2/5 flex flex-col items-start">
          {/* Category Eyebrow */}
          <span className="text-[10px] uppercase tracking-[0.28em] font-medium text-stone-500 mb-2">
            {productData.category} &bull; {productData.subCategory || "Verified Product"}
          </span>

          {/* Title */}
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-stone-950 font-normal leading-tight mb-3">
            {productData.name}
          </h1>

          {/* Star Rating & Review Anchor */}
          <div
            onClick={() => {
              const el = document.getElementById("reviews-section");
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex items-center gap-2 mb-6 cursor-pointer group"
          >
            <StarRating rating={ratingStats.averageRating} size="xs" />
            <span className="text-xs font-semibold text-stone-700 group-hover:underline">
              {ratingStats.averageRating > 0 ? ratingStats.averageRating.toFixed(1) : "New Edition"}
            </span>
            <span className="text-xs text-stone-400 group-hover:underline">
              ({ratingStats.totalReviews} {ratingStats.totalReviews === 1 ? 'client review' : 'client reviews'})
            </span>
          </div>

          {/* Pricing */}
          <div className="mb-6 flex items-baseline gap-3 flex-wrap">
            <span className="font-serif text-3xl font-medium text-stone-950">
              {formatPrice(unitPrice, currency)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-lg text-stone-400 line-through font-light">
                  {formatPrice(listPrice, currency)}
                </span>
                <span className="bg-stone-900 text-white text-[10px] uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-xs">
                  {numDiscount}% OFF
                </span>
              </>
            )}
          </div>

          {/* Live Inventory Status */}
          <div className="mb-5">
            {isSelectedOutOfStock ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 text-xs font-semibold rounded-xs border border-red-200">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                Currently Out of Stock{attributes.length > 0 ? ` in ${variantLabel}` : ""}
              </span>
            ) : selectedStock <= 5 ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 text-xs font-semibold rounded-xs border border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                Low Stock: Only {selectedStock} piece{selectedStock === 1 ? "" : "s"} remaining
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-medium rounded-xs border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                In Stock &bull; Verified inventory ready for fast dispatch
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-stone-600 text-xs sm:text-sm leading-relaxed mb-8 font-normal">
            {productData.description}
          </p>

          {/* Variant Options — selecting one updates price, photo and stock */}
          {attributes.length > 0 && (
            <div className="mb-8 w-full space-y-4">
              {attributes.map((attr) => (
                <div key={attr.name}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs uppercase tracking-wider font-semibold text-stone-900">
                      Select {attr.name}
                    </span>
                    {selectedAttributes[attr.name] && (
                      <span className="text-[11px] font-medium text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
                        {selectedAttributes[attr.name]}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={`Select ${attr.name}`}>
                    {attr.values.map((val) => {
                      const isSelected = selectedAttributes[attr.name] === val;
                      const optionLabel = buildVariantLabel(productData, { ...selectedAttributes, [attr.name]: val });
                      const soldOut = getVariantStock(productData, optionLabel) <= 0;
                      const delta = getPriceDelta(productData, attr.name, val);
                      return (
                        <button
                          type="button"
                          key={val}
                          role="radio"
                          aria-checked={isSelected}
                          disabled={soldOut}
                          onClick={() => selectAttribute(attr.name, val)}
                          title={soldOut ? `${val} is sold out` : undefined}
                          className={`min-w-12 py-2 px-3.5 text-xs tracking-wider rounded-xs transition-all ${
                            soldOut
                              ? "bg-stone-100 text-stone-400 border border-stone-200 line-through cursor-not-allowed opacity-60"
                              : isSelected
                                ? "bg-stone-900 text-white border border-stone-900 shadow-xs cursor-pointer"
                                : "bg-white text-stone-800 border border-stone-300 hover:border-stone-900 cursor-pointer"
                          }`}
                        >
                          {val}
                          {delta !== 0 && (
                            <span className={`ml-1.5 text-[10px] ${isSelected ? "text-stone-300" : "text-stone-500"}`}>
                              {delta > 0 ? "+" : "−"}{formatPrice(Math.abs(delta), currency)}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Standardized Primary Action Button */}
          <button
            type="button"
            disabled={isSelectedOutOfStock || adding}
            onClick={handleAddToCart}
            className={`w-full py-4 text-xs tracking-[0.2em] uppercase font-semibold transition-all ${
              isSelectedOutOfStock
                ? "bg-stone-300 text-stone-500 cursor-not-allowed border border-stone-300"
                : "luxury-btn-primary cursor-pointer disabled:opacity-70"
            }`}
          >
            {isSelectedOutOfStock ? "SOLD OUT" : adding ? "ADDING…" : `ADD TO CART • ${formatPrice(unitPrice, currency)}`}
          </button>

          {/* Platform Guarantees */}
          <div className="mt-8 pt-6 border-t border-stone-200 w-full space-y-3 text-xs text-stone-600">
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
              <span>100% Genuine product guaranteed from verified brands &amp; sellers.</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-stone-800 shrink-0" />
              <span>Flat {formatPrice(delivery_fee, currency)} delivery, free on your first order with code <strong>FIRST</strong>.</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-stone-800 shrink-0" />
              <span>30-day seamless returns and replacements with door-step pickup.</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-stone-800 shrink-0" />
              <span>Safe &amp; secure checkout supporting Cash on Delivery, Cards, and Net Banking.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Reviews Section */}
      <div id="reviews-section" className="mt-20">
        <ReviewsSection
          productId={productData._id}
          productDescription={productData.description}
          onRatingUpdate={handleRatingUpdate}
        />
      </div>

      {/* Curated Complements */}
      <RelatedProducts
        category={productData.category}
        subCategory={productData.subCategory}
      />
    </div>
  );
}

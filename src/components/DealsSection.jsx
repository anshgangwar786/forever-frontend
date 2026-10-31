'use client';

import React from 'react';
import Link from 'next/link';
import { useShopContext } from '../context/ShopContext';
import ProductItem from './ProductItem';

export default function DealsSection() {
  const { products } = useShopContext();

  // Find products with significant discounts
  const dealProducts = products
    .filter((p) => Number(p.discount) >= 15)
    .slice(0, 5);

  if (dealProducts.length === 0) return null;

  return (
    <section className="my-16 sm:my-20 p-6 sm:p-8 rounded-xs border border-stone-200 bg-[#F6F3EC]/70">
      {/* Deals Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-stone-300/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-stone-900 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-red-700 bg-red-100/80 px-2 py-0.5 rounded-xs">
                Limited Time Deals
              </span>
              <span className="text-xs text-stone-500 hidden sm:inline">&bull; Up to 30% OFF</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-stone-950 mt-1">
              Deals of the Day
            </h2>
          </div>
        </div>

        <Link
          href="/collection?deals=true"
          className="text-xs uppercase tracking-wider font-semibold text-stone-800 hover:text-stone-950 hover:underline flex items-center gap-1 group self-end sm:self-auto"
        >
          <span>Explore All Offers</span>
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </Link>
      </div>

      {/* Deals Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 gap-y-8 sm:gap-y-10">
        {dealProducts.map((item, index) => (
          <ProductItem
            key={item._id || index}
            id={item._id}
            name={item.name}
            image={item.image}
            price={item.price}
            discount={item.discount}
            bestseller={item.bestseller}
            sizes={item.sizes}
            stock={item.stock}
          />
        ))}
      </div>
    </section>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { handleImageError } from "./ui/imageFallback";

const categories = [
  {
    name: 'Electronics',
    query: 'Electronics',
    subtitle: 'Audio, Wearables & Gadgets',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
    tag: 'Up to 30% OFF'
  },
  {
    name: 'Fashion & Apparel',
    query: 'Fashion %26 Apparel',
    subtitle: 'Curated Men, Women & Footwear',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80',
    tag: 'New Season'
  },
  {
    name: 'Home & Kitchen',
    query: 'Home %26 Kitchen',
    subtitle: 'Dining, Cookware & Accents',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80',
    tag: 'Trending Picks'
  },
  {
    name: 'Beauty & Wellness',
    query: 'Beauty %26 Personal Care',
    subtitle: 'Botanical Skincare & Fragrances',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80',
    tag: 'Clean Formulations'
  },
  {
    name: 'Sports & Fitness',
    query: 'Sports %26 Fitness',
    subtitle: 'Gear, Activewear & Hydration',
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&q=80',
    tag: 'Top Rated'
  },
  {
    name: 'Accessories',
    // Accessories is a sub-category (under Fashion & Apparel), not a department
    href: '/collection?subCategory=Accessories',
    subtitle: 'Leather Wallets & Eyewear',
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&q=80',
    tag: 'Bestselling'
  }
];

export default function CategoryGrid() {
  return (
    <section className="my-16 sm:my-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 mb-8 pb-4 border-b border-stone-200/80">
        <div>
          <span className="text-[10px] uppercase tracking-[0.28em] font-semibold text-stone-500 block mb-1">
            POPULAR DEPARTMENTS
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-normal text-stone-950">
            Shop by Category
          </h2>
        </div>
        <Link
          href="/collection"
          className="text-xs uppercase tracking-wider font-semibold text-stone-800 hover:text-stone-950 hover:underline flex items-center gap-1 group"
        >
          <span>View All Departments</span>
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {categories.map((cat, idx) => (
          <Link
            key={idx}
            href={cat.href || `/collection?category=${cat.query}`}
            className="group relative flex flex-col overflow-hidden rounded-xs border border-stone-200/90 bg-[#F6F3EC]/50 hover:border-stone-900 transition-all duration-300 hover:shadow-md"
          >
            <div className="relative aspect-4/3 w-full overflow-hidden bg-stone-200">
              <img onError={handleImageError}
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-108"
                loading="lazy"
              />
              <span className="absolute top-2 left-2 bg-stone-900/90 text-white text-[8px] sm:text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-xs backdrop-blur-xs">
                {cat.tag}
              </span>
            </div>

            <div className="p-3 flex flex-col justify-between flex-1">
              <div>
                <h3 className="font-serif text-xs sm:text-sm font-medium text-stone-900 group-hover:text-stone-950 line-clamp-1">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5 font-normal">
                  {cat.subtitle}
                </p>
              </div>
              <span className="text-[10px] uppercase tracking-wider text-stone-900 font-semibold mt-2.5 inline-flex items-center gap-1 group-hover:underline">
                Shop Now →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

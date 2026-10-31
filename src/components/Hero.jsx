'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { handleImageError } from "./ui/imageFallback";

const heroSlides = [
  {
    eyebrow: "NEXT-GEN TECH & AUDIO",
    title: "Smarter Living, Engineered for Sound.",
    description: "Explore industry-leading active noise-cancelling headphones, high-definition smart wearables, and desktop acoustic gear with up to 30% savings.",
    ctaText: "SHOP ELECTRONICS",
    ctaLink: "/collection?category=Electronics",
    secondaryText: "ALL DEPARTMENTS",
    secondaryLink: "/collection",
    badge: "ELECTRONICS HIGHLIGHT",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&q=80"
  },
  {
    eyebrow: "CURATED MODERN WARDROBE",
    title: "Effortless Everyday Style & Tailoring.",
    description: "Discover versatile seasonal silhouettes, conscious textiles, and footwear crafted for timeless wear across men, women, and unisex collections.",
    ctaText: "EXPLORE FASHION",
    ctaLink: "/collection?category=Fashion %26 Apparel",
    secondaryText: "TRENDING DEALS",
    secondaryLink: "/collection?deals=true",
    badge: "FASHION & APPAREL",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1000&q=80"
  },
  {
    eyebrow: "MINIMALIST HOME & COOKWARE",
    title: "Elevate Your Sanctuary & Culinary Space.",
    description: "Handcrafted stoneware, precision Damascus chef knives, enameled cast iron cookware, and aromatherapy essentials designed for thoughtful living.",
    ctaText: "SHOP HOME & LIVING",
    ctaLink: "/collection?category=Home %26 Kitchen",
    secondaryText: "VIEW BESTSELLERS",
    secondaryLink: "/collection?bestseller=true",
    badge: "HOME & KITCHEN",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=1000&q=80"
  }
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slide = heroSlides[currentSlide];

  return (
    <section className="mt-4 sm:mt-6 border border-stone-200/90 bg-[#F6F3EC] overflow-hidden rounded-xs">
      {/* Category Slide Selector Tabs */}
      <div className="flex border-b border-stone-200/80 bg-stone-100/60 overflow-x-auto text-[11px] uppercase tracking-wider font-semibold text-stone-600">
        {heroSlides.map((s, idx) => (
          <button
            type="button"
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`py-3 px-5 sm:px-8 border-b-2 transition-all cursor-pointer whitespace-nowrap focus:outline-none ${
              currentSlide === idx
                ? "border-stone-900 text-stone-950 bg-[#F6F3EC] font-bold"
                : "border-transparent text-stone-500 hover:text-stone-900 hover:bg-stone-200/50"
            }`}
          >
            {s.badge}
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row items-stretch">
        {/* Left Editorial Narrative */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-14 lg:px-16 py-12 sm:py-16 lg:py-20">
          <div className="max-w-xl">
            {/* Department Eyebrow */}
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <span className="w-8 sm:w-12 h-px bg-stone-800" aria-hidden="true" />
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-semibold text-stone-700">
                {slide.eyebrow}
              </p>
            </div>

            {/* Headline */}
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-stone-950 font-normal leading-[1.15] tracking-tight mb-5">
              {slide.title}
            </h1>

            {/* Description */}
            <p className="text-stone-600 text-xs sm:text-sm md:text-base font-normal leading-relaxed mb-8 max-w-md">
              {slide.description}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href={slide.ctaLink}
                className="luxury-btn-primary"
              >
                <span>{slide.ctaText}</span>
                <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
              </Link>

              <Link
                href={slide.secondaryLink}
                className="luxury-btn-secondary"
              >
                {slide.secondaryText}
              </Link>
            </div>

            {/* Promotional Trust Strip Hook */}
            <div className="mt-8 pt-6 border-t border-stone-300/60 flex items-center gap-2 text-[11px] text-stone-600">
              <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
              <p>
                First time shopping? Use promo code <strong className="font-semibold text-stone-900 tracking-wider">FIRST</strong> at checkout for free delivery on your debut order.
              </p>
            </div>
          </div>
        </div>

        {/* Right Imagery */}
        <div className="w-full lg:w-1/2 relative min-h-[340px] sm:min-h-[440px] bg-stone-200">
          <img onError={handleImageError}
            key={slide.image}
            className="w-full h-full object-cover object-center animate-fadeIn"
            src={slide.image}
            alt={slide.title}
            loading="eager"
          />
          <div className="absolute inset-0 bg-stone-950/5 pointer-events-none" />
        </div>
      </div>
    </section>
  );
}

'use client';

import React from "react";
import Title from "../../components/Title";
import { assets } from "../../assets/assets";
import NewsletterBox from "../../components/NewsletterBox";
import Link from "next/link";

const getImageSrc = (img) => (typeof img === "object" && img?.src ? img.src : img);

export default function About() {
  const pillars = [
    {
      title: "Curated Brand Authenticity",
      description: "Every product is sourced from verified manufacturers, certified artisans, and licensed sellers with strict 100% authenticity guarantees."
    },
    {
      title: "Cross-Department Excellence",
      description: "From cutting-edge electronics and modern apparel to culinary cookware and wellness formulations, our standards remain uncompromising."
    },
    {
      title: "Reliable Global Fulfillment",
      description: "Express tracking, insured door-to-door shipping, and 30-day effortless returns ensure complete peace of mind with every order."
    }
  ];

  return (
    <div className="py-6 sm:py-10">
      {/* Page Title */}
      <div className="text-center pb-8 border-b border-stone-200/80">
        <Title text1="ABOUT" text2="VELLORA" />
        <p className="text-stone-600 text-xs sm:text-sm tracking-wide max-w-lg mx-auto mt-1 font-normal">
          A modern multi-category e-commerce platform engineered for quality, reliability, and seamless everyday shopping.
        </p>
      </div>

      {/* Main Editorial Story */}
      <div className="my-14 sm:my-20 flex flex-col lg:flex-row items-center gap-12 sm:gap-16">
        <div className="w-full lg:w-1/2 overflow-hidden rounded-xs bg-[#F4F1EA] border border-stone-200/80">
          <img
            className="w-full h-full object-cover object-center max-h-[520px]"
            src={getImageSrc(assets.about_img)}
            alt="Vellora E-Commerce Fulfillment & Curation"
          />
        </div>

        <div className="flex flex-col justify-center gap-6 lg:w-1/2 text-stone-600 text-xs sm:text-sm leading-relaxed">
          <span className="text-[10px] uppercase tracking-[0.3em] font-medium text-stone-800">
            OUR MISSION &amp; PLATFORM
          </span>

          <h2 className="font-serif text-2xl sm:text-4xl text-stone-950 font-normal leading-snug">
            Curated Commerce Designed for Modern Living.
          </h2>

          <p>
            Vellora was built on a simple conviction: modern consumers deserve a unified e-commerce marketplace where exceptional design, rigorous product quality, and effortless shopping converge. Rather than sifting through endless low-tier listings, Vellora curates only dependable, highly rated products across technology, fashion, home essentials, and personal care.
          </p>

          <p>
            Whether you are upgrading your workspace with precision acoustics and mechanical keyboards, refreshing your wardrobe with conscious textiles, or elevating your kitchen with enameled cookware, Vellora connects you directly with verified brands and sellers.
          </p>

          <div className="pt-2 border-t border-stone-200">
            <h3 className="font-serif text-base text-stone-900 font-semibold mb-2">
              Our Commitment
            </h3>
            <p>
              To deliver an elevated marketplace experience rooted in transparency, fair pricing, prompt customer care, and guaranteed buyer protection.
            </p>
          </div>

          <div className="pt-4">
            <Link href="/collection" className="luxury-btn-primary">
              EXPLORE ALL DEPARTMENTS
            </Link>
          </div>
        </div>
      </div>

      {/* The Pillars / Why Choose Us */}
      <div className="my-16 sm:my-24">
        <div className="text-center pb-8 sm:pb-12">
          <Title text1="THE VELLORA" text2="STANDARD" />
          <p className="text-stone-600 text-xs sm:text-sm max-w-md mx-auto">
            Guiding principles that elevate every product and purchase on our platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map((pillar, idx) => (
            <div
              key={idx}
              className="bg-[#F6F3EC]/80 border border-stone-200/80 p-8 sm:p-10 rounded-xs flex flex-col gap-3 group hover:border-stone-400 transition-colors"
            >
              <span className="text-stone-400 font-serif text-2xl font-light">
                0{idx + 1}
              </span>
              <h3 className="font-serif text-lg font-medium text-stone-900 tracking-wide">
                {pillar.title}
              </h3>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed font-normal">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <NewsletterBox />
    </div>
  );
}

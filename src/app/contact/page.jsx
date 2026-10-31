'use client';

import React from "react";
import Title from "../../components/Title";
import NewsletterBox from "../../components/NewsletterBox";
import { assets } from "../../assets/assets";

const getImageSrc = (img) => (typeof img === "object" && img?.src ? img.src : img);

export default function Contact() {
  const adminUrl =
    process.env.NEXT_PUBLIC_ADMIN_URL ||
    "http://localhost:5174";

  return (
    <div className="py-6 sm:py-10">
      <div className="text-center pb-8 border-b border-stone-200/80">
        <Title text1="CUSTOMER" text2="SUPPORT" />
        <p className="text-stone-600 text-xs sm:text-sm tracking-wide max-w-md mx-auto mt-1 font-normal">
          Order tracking, delivery inquiries, merchant partnerships, and 24/7 customer care.
        </p>
      </div>

      <div className="my-14 sm:my-20 flex flex-col lg:flex-row items-center justify-center gap-12 sm:gap-16">
        <div className="w-full lg:w-1/2 overflow-hidden rounded-xs bg-[#F4F1EA] border border-stone-200/80">
          <img
            src={getImageSrc(assets.contact_img)}
            className="w-full h-full object-cover object-center max-h-[500px]"
            alt="Vellora Customer Support & Headquarters"
          />
        </div>

        <div className="flex flex-col justify-center items-start gap-8 lg:w-1/2 text-stone-600 text-xs sm:text-sm">
          {/* Operations & Hub */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-[0.25em] font-medium text-stone-500">
              OPERATIONS &amp; LOGISTICS HUB
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-medium text-stone-900">
              Vellora Global Commerce
            </h3>
            <p className="text-stone-600 leading-relaxed">
              742 Madison Avenue, Suite 400 <br />
              New York, NY 10065, United States
            </p>
          </div>

          {/* Customer Lines */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-[0.25em] font-medium text-stone-500">
              DIRECT CUSTOMER ASSISTANCE
            </span>
            <p className="text-stone-700 font-medium">
              Customer Helpdesk: +1 (800) 835-5672
            </p>
            <p className="text-stone-700 font-medium">
              Email Support: support@vellora.com
            </p>
            <p className="text-stone-400 text-xs">
              Live Chat &amp; Email Support available 24 hours a day, 7 days a week.
            </p>
          </div>

          {/* Merchant & Partner Section */}
          <div className="pt-6 border-t border-stone-200 w-full flex flex-col gap-3">
            <span className="text-[10px] uppercase tracking-[0.25em] font-medium text-stone-500">
              MERCHANTS &amp; BRANDS
            </span>
            <h4 className="font-serif text-lg font-medium text-stone-900">
              Sell on Vellora Marketplace
            </h4>
            <p className="text-stone-600 max-w-md leading-relaxed">
              Reach thousands of engaged buyers across tech, fashion, home goods, and beauty. Grow your store with automated fulfillment and transparent seller tools.
            </p>
            <div className="pt-2">
              <a
                href={`${adminUrl}/register`}
                target="_blank"
                rel="noopener noreferrer"
                className="luxury-btn-secondary"
              >
                REGISTER AS A SELLER ↗
              </a>
            </div>
          </div>
        </div>
      </div>

      <NewsletterBox />
    </div>
  );
}

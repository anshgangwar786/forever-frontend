'use client';

import React from 'react';
import Link from 'next/link';

const Footer = () => {
  const adminUrl =
    process.env.NEXT_PUBLIC_ADMIN_URL ||
    "http://localhost:5174";

  return (
    <footer className="mt-24 pt-16 pb-12 border-t border-stone-200 text-stone-700">
      {/* Main 5-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 sm:gap-12 mb-16 text-xs">
        {/* Brand Column (Span 2) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Link href="/" className="inline-block group focus:outline-none">
            <span className="font-serif text-2xl tracking-[0.24em] font-semibold text-stone-900 uppercase group-hover:opacity-80 transition-opacity">
              Vellora
            </span>
            <span className="text-[9px] tracking-[0.35em] text-stone-500 uppercase block -mt-1 font-sans font-medium pl-0.5">
              Marketplace
            </span>
          </Link>
          <p className="text-stone-600 text-xs sm:text-[13px] leading-relaxed max-w-sm font-normal">
            Your destination for curated quality across Electronics, Fashion &amp; Apparel, Home &amp; Kitchen, Beauty, and Sports. Guaranteed authentic items, secure payments, and fast door-to-door delivery.
          </p>
          <div className="pt-2 text-[11px] text-stone-500 tracking-wider uppercase font-medium">
            Global Fulfillment &bull; 100% Genuine Guarantee &bull; 30-Day Returns
          </div>
        </div>

        {/* Column 2: Popular Departments */}
        <div className="flex flex-col gap-3">
          <h4 className="font-serif text-xs uppercase tracking-[0.2em] font-semibold text-stone-900 mb-1">
            Departments
          </h4>
          <ul className="flex flex-col gap-2.5 text-stone-600">
            <li>
              <Link href="/collection?category=Electronics" className="hover:text-stone-950 transition-colors">
                Electronics &amp; Audio
              </Link>
            </li>
            <li>
              <Link href="/collection?category=Fashion %26 Apparel" className="hover:text-stone-950 transition-colors">
                Fashion &amp; Apparel
              </Link>
            </li>
            <li>
              <Link href="/collection?category=Home %26 Kitchen" className="hover:text-stone-950 transition-colors">
                Home &amp; Kitchen
              </Link>
            </li>
            <li>
              <Link href="/collection?category=Beauty %26 Personal Care" className="hover:text-stone-950 transition-colors">
                Beauty &amp; Personal Care
              </Link>
            </li>
            <li>
              <Link href="/collection?category=Sports %26 Fitness" className="hover:text-stone-950 transition-colors">
                Sports &amp; Fitness
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Customer Care */}
        <div className="flex flex-col gap-3">
          <h4 className="font-serif text-xs uppercase tracking-[0.2em] font-semibold text-stone-900 mb-1">
            Customer Care
          </h4>
          <ul className="flex flex-col gap-2.5 text-stone-600">
            <li>
              <Link href="/orders" className="hover:text-stone-950 transition-colors">
                Track My Orders
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-stone-950 transition-colors">
                Shopping Cart
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-stone-950 transition-colors">
                About Our Platform
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-stone-950 transition-colors">
                Customer Support
              </Link>
            </li>
            <li>
              <span className="text-stone-500">support@vellora.com</span>
            </li>
          </ul>
        </div>

        {/* Column 4: Partnerships & Seller Portal */}
        <div className="flex flex-col gap-3">
          <h4 className="font-serif text-xs uppercase tracking-[0.2em] font-semibold text-stone-900 mb-1">
            Seller Central
          </h4>
          <ul className="flex flex-col gap-2.5 text-stone-600">
            <li>
              <a
                href={`${adminUrl}/register`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-stone-950 transition-colors inline-flex items-center gap-1 font-medium"
              >
                <span>Become a Seller</span>
                <span className="text-[10px]">↗</span>
              </a>
            </li>
            <li>
              <a
                href={adminUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-stone-950 transition-colors inline-flex items-center gap-1 font-medium"
              >
                <span>Merchant &amp; Admin Portal</span>
                <span className="text-[10px]">↗</span>
              </a>
            </li>
            <li>
              <Link href="/contact" className="hover:text-stone-950 transition-colors">
                Corporate Partnerships
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Sub-Footer: Copyright & Compliance */}
      <div className="pt-8 border-t border-stone-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
        <p className="tracking-wide">
          © 2026 Vellora Marketplace. All Rights Reserved.
        </p>
        <div className="flex items-center gap-6 text-[11px] text-stone-500">
          <span>Verified Merchants</span>
          <span>&bull;</span>
          <span>Express Delivery</span>
          <span>&bull;</span>
          <span>Encrypted 256-Bit SSL Checkout</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

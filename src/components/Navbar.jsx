'use client';

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useShopContext } from "../context/ShopContext";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef(null);
  const profileRef = useRef(null);
  const searchContainerRef = useRef(null);
  const pathname = usePathname();

  const adminUrl =
    process.env.NEXT_PUBLIC_ADMIN_URL ||
    "http://localhost:5174";

  const {
    search,
    setSearch,
    getCartCount,
    navigate,
    token,
    logout,
  } = useShopContext();

  // Focus search input when expanded
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target) &&
        !search
      ) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [search]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (pathname !== "/collection") {
      navigate("/collection");
    }
  };

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Collection", href: "/collection" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-stone-200/80 transition-all">
      <div className="py-4.5 flex justify-between items-center gap-4">
        {/* Brand Logo / Wordmark */}
        <Link href="/" className="group flex flex-col items-start focus:outline-none" aria-label="Vellora Home">
          <span className="font-serif text-2xl sm:text-[28px] tracking-[0.24em] font-semibold text-stone-900 uppercase group-hover:opacity-80 transition-opacity">
            Vellora
          </span>
          <span className="text-[9px] tracking-[0.35em] text-stone-500 uppercase -mt-1 font-sans font-medium pl-0.5">
            Marketplace
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-10" aria-label="Main Navigation">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative py-1 text-xs uppercase tracking-[0.2em] font-medium transition-colors ${
                  isActive ? "text-stone-950 font-semibold" : "text-stone-600 hover:text-stone-950"
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-stone-900 transition-all duration-300" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Icons & Search */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Become a Seller Badge */}
          <a
            href={`${adminUrl}/register`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:inline-flex items-center text-[11px] uppercase tracking-wider font-semibold border border-stone-300 text-stone-700 px-3.5 py-1.5 rounded-full hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all duration-300"
          >
            Become a Seller
          </a>

          {/* Integrated Sleek Collapsible Search */}
          <div ref={searchContainerRef} className="relative flex items-center">
            {searchOpen ? (
              <form
                onSubmit={handleSearchSubmit}
                className="flex items-center border-b border-stone-900 pb-0.5 animate-fadeIn"
              >
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search products, departments..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    if (pathname !== "/collection") {
                      navigate("/collection");
                    }
                  }}
                  className="w-36 sm:w-60 bg-transparent text-xs text-stone-900 placeholder-stone-400 focus:outline-none tracking-wide"
                />
                {search ? (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="text-stone-400 hover:text-stone-700 p-1 text-xs"
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="text-stone-400 hover:text-stone-700 p-1 text-xs"
                    aria-label="Close search"
                  >
                    ✕
                  </button>
                )}
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="p-1.5 text-stone-700 hover:text-stone-950 hover:scale-105 transition-transform cursor-pointer focus:outline-none"
                aria-label="Open search bar"
              >
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                </svg>
              </button>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div ref={profileRef} className="relative inline-block">
            <button
              type="button"
              onClick={() => (token ? setProfileMenuOpen((prev) => !prev) : navigate("/login"))}
              className="p-1.5 text-stone-700 hover:text-stone-950 hover:scale-105 transition-transform cursor-pointer focus:outline-none"
              aria-label="Account Profile"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>

            {token && profileMenuOpen && (
              <div className="absolute right-0 top-full mt-2 z-50 w-48 bg-white border border-stone-200 rounded-lg shadow-xl py-2 text-xs divide-y divide-stone-100">
                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      navigate("/profile");
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-stone-50 text-stone-800 transition-colors"
                  >
                    My Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      navigate("/orders");
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-stone-50 text-stone-800 transition-colors"
                  >
                    Orders & Purchases
                  </button>
                </div>
                <div className="py-1">
                  <a
                    href={`${adminUrl}/login`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setProfileMenuOpen(false)}
                    className="block px-4 py-2 hover:bg-stone-50 text-stone-700 transition-colors"
                  >
                    Seller Portal ↗
                  </a>
                  <a
                    href={`${adminUrl}/register`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setProfileMenuOpen(false)}
                    className="block px-4 py-2 hover:bg-stone-50 text-stone-700 transition-colors"
                  >
                    Register as Seller
                  </a>
                </div>
                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 font-medium transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Cart Bag Icon & Count */}
          <Link
            href="/cart"
            className="p-1.5 text-stone-700 hover:text-stone-950 relative hover:scale-105 transition-transform focus:outline-none"
            aria-label="Shopping Cart Bag"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {getCartCount() > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-stone-900 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold shadow-xs">
                {getCartCount()}
              </span>
            )}
          </Link>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-1.5 text-stone-700 hover:text-stone-950 focus:outline-none"
            aria-label="Open Navigation Menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Category / Department Strip */}
      <div className="py-2 border-t border-stone-200/60 overflow-x-auto scrollbar-none flex items-center gap-1.5 sm:gap-2 text-[11px] font-medium text-stone-600">
        <Link
          href="/collection"
          className="px-2.5 py-1 rounded-full hover:bg-stone-200/70 hover:text-stone-950 transition-colors whitespace-nowrap font-semibold text-stone-900"
        >
          All Departments
        </Link>
        <span className="text-stone-300">|</span>
        <Link
          href="/collection?category=Electronics"
          className="px-2.5 py-1 rounded-full hover:bg-stone-200/70 hover:text-stone-950 transition-colors whitespace-nowrap"
        >
          Electronics
        </Link>
        <Link
          href="/collection?category=Fashion %26 Apparel"
          className="px-2.5 py-1 rounded-full hover:bg-stone-200/70 hover:text-stone-950 transition-colors whitespace-nowrap"
        >
          Fashion &amp; Apparel
        </Link>
        <Link
          href="/collection?category=Home %26 Kitchen"
          className="px-2.5 py-1 rounded-full hover:bg-stone-200/70 hover:text-stone-950 transition-colors whitespace-nowrap"
        >
          Home &amp; Kitchen
        </Link>
        <Link
          href="/collection?category=Beauty %26 Personal Care"
          className="px-2.5 py-1 rounded-full hover:bg-stone-200/70 hover:text-stone-950 transition-colors whitespace-nowrap"
        >
          Beauty &amp; Care
        </Link>
        <Link
          href="/collection?category=Sports %26 Fitness"
          className="px-2.5 py-1 rounded-full hover:bg-stone-200/70 hover:text-stone-950 transition-colors whitespace-nowrap"
        >
          Sports &amp; Fitness
        </Link>
        <Link
          href="/collection?subCategory=Accessories"
          className="px-2.5 py-1 rounded-full hover:bg-stone-200/70 hover:text-stone-950 transition-colors whitespace-nowrap"
        >
          Accessories
        </Link>
        <Link
          href="/collection?deals=true"
          className="px-2.5 py-1 rounded-full bg-red-50 text-red-700 hover:bg-red-100 transition-colors whitespace-nowrap font-semibold ml-auto flex items-center gap-1"
        >
          <span>⚡ Deals of the Day</span>
        </Link>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Menu */}
          <div className="relative w-4/5 max-w-sm bg-[#FAF8F5] h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex justify-between items-center pb-6 border-b border-stone-200">
                <span className="font-serif text-xl tracking-[0.2em] font-semibold text-stone-900 uppercase">
                  Vellora
                </span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-stone-500 hover:text-stone-900 cursor-pointer"
                  aria-label="Close navigation drawer"
                >
                  ✕
                </button>
              </div>

              <nav className="flex flex-col py-6 divide-y divide-stone-100">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-3.5 text-sm uppercase tracking-[0.2em] text-stone-800 hover:text-stone-950 font-medium"
                  >
                    {link.label}
                  </Link>
                ))}
                <a
                  href={`${adminUrl}/register`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3.5 text-xs uppercase tracking-wider text-stone-600 hover:text-stone-950 flex items-center justify-between"
                >
                  <span>Become a Seller</span>
                  <span>↗</span>
                </a>
              </nav>
            </div>

            <div className="pt-6 border-t border-stone-200 text-xs text-stone-500 flex flex-col gap-2">
              <p className="tracking-wide">Customer Support Concierge</p>
              <p className="font-medium text-stone-800">support@vellora.com</p>
              <p className="text-[11px] text-stone-400 mt-2">© 2026 Vellora Marketplace. All Rights Reserved.</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

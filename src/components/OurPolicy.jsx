'use client';

import React from 'react';

const OurPolicy = () => {
  const policies = [
    {
      title: "Fast Shipping",
      description: "Flat $10 delivery on every order, and free delivery on your first order with code FIRST.",
      icon: (
        <svg className="w-6 h-6 text-stone-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
        </svg>
      )
    },
    {
      title: "100% Authentic Guarantee",
      description: "Every piece is rigorously inspected and verified directly from certified brand partners and stores.",
      icon: (
        <svg className="w-6 h-6 text-stone-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    {
      title: "30-Day Easy Returns",
      description: "Hassle-free return and exchange requests with rapid door-step collection and quick refunds.",
      icon: (
        <svg className="w-6 h-6 text-stone-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      )
    },
    {
      title: "24/7 Customer Care",
      description: "Dedicated support team on standby round-the-clock to assist with tracking, orders, and inquiries.",
      icon: (
        <svg className="w-6 h-6 text-stone-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    }
  ];

  return (
    <section className="py-12 sm:py-16 border-t border-b border-stone-200/80 my-16 bg-[#F6F3EC]/70 rounded-xs">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-6 sm:px-10">
        {policies.map((policy, idx) => (
          <div key={idx} className="flex flex-col items-center text-center group">
            <div className="w-12 h-12 rounded-full bg-white border border-stone-200 flex items-center justify-center mb-4 shadow-xs group-hover:scale-105 transition-transform duration-300">
              {policy.icon}
            </div>
            <h3 className="font-serif text-sm sm:text-base font-semibold text-stone-900 tracking-wide mb-1.5">
              {policy.title}
            </h3>
            <p className="text-stone-600 text-xs font-normal max-w-xs leading-relaxed">
              {policy.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default OurPolicy;

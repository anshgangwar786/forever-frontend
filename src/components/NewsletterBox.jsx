'use client';

import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useShopContext } from '../context/ShopContext';

const NewsletterBox = () => {
  const { backendUrl } = useShopContext();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!email.trim() || sending) return;
    try {
      setSending(true);
      const res = await axios.post(`${backendUrl}/api/v1/newsletter/subscribe`, { email: email.trim() });
      setSubmitted(true);
      toast.success(res.data?.message || 'Welcome to the Vellora Private Circle.');
      setEmail('');
    } catch (error) {
      toast.error(error.response?.data?.message || "We couldn't subscribe you right now. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="my-16 sm:my-24 py-14 sm:py-20 px-6 sm:px-12 bg-[#F6F3EC] border border-stone-200/80 rounded-xs text-center">
      <div className="max-w-xl mx-auto">
        <span className="text-[10px] uppercase tracking-[0.3em] font-medium text-stone-600 block mb-3">
          EXCLUSIVE PLATFORM PRIVILEGES
        </span>
        <h2 className="font-serif text-2xl sm:text-4xl font-normal text-stone-950 tracking-tight mb-4">
          Join Vellora Rewards &amp; Offers
        </h2>
        <p className="text-stone-600 text-xs sm:text-sm leading-relaxed mb-8 font-normal">
          Get early access to flash deals, new department drops, and complimentary delivery on your debut order with code <strong className="font-semibold text-stone-900 tracking-wider">FIRST</strong>.
        </p>

        {submitted ? (
          <div className="bg-white border border-stone-200 p-4 rounded-xs inline-flex items-center gap-2 text-stone-900 text-xs font-medium">
            <span className="text-emerald-600 font-bold">✓</span> You are subscribed to the Vellora Gazette.
          </div>
        ) : (
          <form
            onSubmit={onSubmitHandler}
            className="flex flex-col sm:flex-row items-stretch gap-2.5 max-w-md mx-auto"
          >
            <input
              className="flex-1 bg-white border border-stone-300 rounded-xs px-4 py-3.5 text-xs tracking-wide text-stone-900 placeholder-stone-400 focus:border-stone-900 focus:outline-none transition-colors"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-label="Email address for luxury newsletter subscription"
            />
            <button
              type="submit"
              disabled={sending}
              className="luxury-btn-primary shrink-0 disabled:opacity-60"
            >
              {sending ? "SUBSCRIBING…" : "SUBSCRIBE"}
            </button>
          </form>
        )}

        <p className="text-[10px] text-stone-400 mt-4 tracking-wide">
          By subscribing, you agree to Vellora&apos;s Privacy Policy. To unsubscribe, contact our support team at any time.
        </p>
      </div>
    </section>
  );
};

export default NewsletterBox;

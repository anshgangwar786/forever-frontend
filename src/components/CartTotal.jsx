'use client';

import React from 'react';
import { useShopContext } from '../context/ShopContext';
import Title from './Title';
import { formatMoney } from '../utils/pricing';

const CartTotal = ({ coupon = null, showTitle = true }) => {
  const { currency, delivery_fee, getCartAmount } = useShopContext();

  // Same math as the server: shipping is charged and the coupon discounts it
  const isFreeDelivery = coupon?.code === "FIRST" || coupon?.discountType === "free_delivery";
  const subtotal = getCartAmount();
  const shipping = subtotal === 0 ? 0 : delivery_fee;
  const couponDiscount = isFreeDelivery ? shipping : 0;
  const finalTotal = subtotal + shipping - couponDiscount;

  return (
    <div className='w-full'>
      {showTitle && (
        <div className='text-2xl'>
          <Title text1={'CART'} text2={'TOTALS'} />
        </div>
      )}
      <div className='flex flex-col gap-2 mt-2 text-sm'>
        <div className='flex justify-between'>
          <p>Subtotal</p>
          <p>
            {formatMoney(subtotal, currency)}
          </p>
        </div>
        <hr />
        <div className='flex justify-between items-center'>
          <p>Shipping Fee</p>
          <p>
            {isFreeDelivery ? (
              <>
                <span className="line-through text-gray-400 mr-1.5">{formatMoney(shipping, currency)}</span>
                <span className="text-emerald-600 font-bold uppercase text-xs px-2 py-0.5 bg-emerald-50 rounded">FREE</span>
              </>
            ) : (
              formatMoney(shipping, currency)
            )}
          </p>
        </div>
        {isFreeDelivery && (
          <>
            <hr />
            <div className='flex justify-between text-emerald-600 font-medium text-xs'>
              <p className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Coupon ({coupon.code})
              </p>
              <p>- {formatMoney(couponDiscount, currency)}</p>
            </div>
          </>
        )}
        <hr />
        <div className='flex justify-between'>
          <b>Total</b>
          <b className="text-base text-gray-900">
            {formatMoney(finalTotal, currency)}
          </b>
        </div>
      </div>
    </div>
  );
};

export default CartTotal;

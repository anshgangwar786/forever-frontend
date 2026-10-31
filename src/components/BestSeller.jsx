'use client';

import React, { useEffect, useState } from 'react';
import { useShopContext } from '../context/ShopContext';
import Title from './Title';
import ProductItem from './ProductItem';

const BestSeller = () => {
  const { products } = useShopContext();
  const [bestSeller, setBestSeller] = useState([]);

  useEffect(() => {
    const bestProduct = products.filter((item) => item.bestseller);
    setBestSeller(bestProduct.slice(0, 5));
  }, [products]);

  return (
    <section className="my-16 sm:my-24">
      {/* Editorial Header */}
      <div className="text-center pb-8 sm:pb-12 max-w-2xl mx-auto">
        <Title text1="TOP" text2="BESTSELLERS" />
        <p className="text-stone-600 text-xs sm:text-sm leading-relaxed font-normal">
          Our top-rated customer favorites across all departments, celebrated for verified quality, premium performance, and outstanding value.
        </p>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 gap-y-8 sm:gap-y-10">
        {bestSeller.map((item, index) => (
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
};

export default BestSeller;

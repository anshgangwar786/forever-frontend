'use client';

import React, { useEffect, useState } from 'react';
import { useShopContext } from '../context/ShopContext';
import Title from './Title';
import ProductItem from './ProductItem';

const LatestCollection = () => {
  const { products } = useShopContext();
  const [latestProducts, setLatestProducts] = useState([]);

  useEffect(() => {
    setLatestProducts(products.slice(0, 10));
  }, [products]);

  return (
    <section className="my-16 sm:my-24">
      {/* Editorial Header */}
      <div className="text-center pb-8 sm:pb-12 max-w-2xl mx-auto">
        <Title text1="LATEST" text2="ARRIVALS" />
        <p className="text-stone-600 text-xs sm:text-sm leading-relaxed font-normal">
          Explore recently added essentials across Electronics, Fashion, Home &amp; Living, and Beauty with verified quality and express dispatch.
        </p>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 gap-y-8 sm:gap-y-10">
        {latestProducts.map((item, index) => (
          <ProductItem
            key={item._id || index}
            id={item._id}
            image={item.image}
            name={item.name}
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

export default LatestCollection;

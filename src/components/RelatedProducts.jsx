'use client';

import React, { useEffect, useState } from 'react';
import { useShopContext } from '../context/ShopContext';
import Title from './Title';
import ProductItem from './ProductItem';

const RelatedProducts = ({ category, subCategory }) => {
  const { products } = useShopContext();
  const [related, setRelated] = useState([]);

  useEffect(() => {
    if (products.length > 0) {
      let productsCopy = products.slice();
      productsCopy = productsCopy.filter((item) => category === item.category);
      productsCopy = productsCopy.filter((item) => subCategory === item.subCategory);
      setRelated(productsCopy.slice(0, 5));
    }
  }, [products, category, subCategory]);

  return (
    <section className="my-20">
      <div className="text-center pb-8 sm:pb-12">
        <Title text1="CURATED" text2="COMPLEMENTS" />
        <p className="text-stone-600 text-xs sm:text-sm">
          Pieces handpicked to pair harmoniously with your selection.
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 gap-y-8 sm:gap-y-10">
        {related.map((item, index) => (
          <ProductItem
            key={item._id || index}
            id={item._id}
            name={item.name}
            price={item.price}
            discount={item.discount}
            image={item.image}
            bestseller={item.bestseller}
            sizes={item.sizes}
            stock={item.stock}
          />
        ))}
      </div>
    </section>
  );
};

export default RelatedProducts;

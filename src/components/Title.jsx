import React from 'react';

const Title = ({ text1, text2 }) => {
  return (
    <div className='inline-flex items-center gap-3 mb-3'>
      <h2 className='font-serif text-2xl sm:text-3xl tracking-[0.14em] font-normal uppercase text-stone-500'>
        {text1} <span className='text-stone-900 font-semibold'>{text2}</span>
      </h2>
      <span className='w-8 sm:w-14 h-px bg-stone-400 mt-0.5' aria-hidden="true" />
    </div>
  );
};

export default Title;

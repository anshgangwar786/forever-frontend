'use client';

import React, { useEffect, useState, useMemo, Suspense } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useShopContext } from "../../context/ShopContext";
import ProductItem from "../../components/ProductItem";
import Title from "../../components/Title";
import { getStartingPrice } from "../../utils/pricing";

function CollectionContent() {
  const searchParams = useSearchParams();
  const [shopFilter, setShopFilter] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState("relevant");
  const [dealsOnly, setDealsOnly] = useState(false);
  const [bestsellerOnly, setBestsellerOnly] = useState(false);

  const { products, productsLoading, productsError, search, setSearch, backendUrl } = useShopContext();
  const [categoriesList, setCategoriesList] = useState([]);
  const [subCategoriesList, setSubCategoriesList] = useState([]);

  // Initialize filters from URL query parameters (e.g. ?category=Electronics or ?deals=true)
  useEffect(() => {
    const urlCategory = searchParams.get("category");
    const urlSubCategory = searchParams.get("subCategory");
    const urlDeals = searchParams.get("deals");
    const urlSearch = searchParams.get("search");

    const urlBestseller = searchParams.get("bestseller");

    // Each navigation (e.g. navbar links) starts from exactly what the URL asks for
    setCategory(urlCategory ? [urlCategory] : []);
    setSubCategory(urlSubCategory ? [urlSubCategory] : []);
    setDealsOnly(urlDeals === "true");
    setBestsellerOnly(urlBestseller === "true");
    setSortType(urlDeals === "true" ? "discount" : "relevant");
    if (urlSearch) {
      setSearch(urlSearch);
    }
  }, [searchParams, setSearch]);

  // Fetch dynamic categories from backend if reachable
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/v1/category`);
        if (res.data.success && Array.isArray(res.data.data)) {
          const mainCats = res.data.data.filter((item) => !item.parentCategory);
          const subs = res.data.data.filter((item) => Boolean(item.parentCategory));
          setCategoriesList(mainCats);
          setSubCategoriesList(subs);
        }
      } catch (e) {
        // Fallback to product-inferred categories
      }
    };
    if (backendUrl) fetchCats();
  }, [backendUrl]);

  // Dynamically compute available categories from products & database
  const availableCategories = useMemo(() => {
    const set = new Set();
    categoriesList.forEach((c) => set.add(c.name));
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [categoriesList, products]);

  // Dynamically map sub-categories based on selected primary categories
  const availableSubCategories = useMemo(() => {
    if (category.length > 0) {
      const selectedCatObjects = categoriesList.filter((c) =>
        category.some((catName) => catName.toLowerCase() === c.name.toLowerCase())
      );
      const selectedCatIds = new Set(selectedCatObjects.map((c) => String(c._id)));

      const matchedSubs = new Set();
      subCategoriesList.forEach((sub) => {
        const parentId = typeof sub.parentCategory === "object" ? sub.parentCategory?._id : sub.parentCategory;
        const parentName = typeof sub.parentCategory === "object" ? sub.parentCategory?.name : "";
        if (
          selectedCatIds.has(String(parentId)) ||
          category.some((cn) => cn.toLowerCase() === (parentName || "").toLowerCase())
        ) {
          matchedSubs.add(sub.name);
        }
      });

      products.forEach((p) => {
        if (category.includes(p.category) && p.subCategory) {
          matchedSubs.add(p.subCategory);
        }
      });

      return Array.from(matchedSubs);
    }

    const set = new Set();
    subCategoriesList.forEach((sub) => set.add(sub.name));
    products.forEach((p) => {
      if (p.subCategory) set.add(p.subCategory);
    });
    return Array.from(set);
  }, [category, categoriesList, subCategoriesList, products]);

  // Drop sub-category picks that no longer belong to the selected departments
  useEffect(() => {
    if (category.length === 0) return;
    setSubCategory((prev) => {
      const kept = prev.filter((sub) => availableSubCategories.includes(sub));
      return kept.length === prev.length ? prev : kept;
    });
  }, [category, availableSubCategories]);

  const [debouncedSearch, setDebouncedSearch] = useState(search);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 200);

    return () => clearTimeout(timer);
  }, [search]);

  const toggleCategory = (e) => {
    const val = e.target.value;
    setCategory((prev) =>
      prev.includes(val) ? prev.filter((item) => item !== val) : [...prev, val]
    );
  };

  const toggleSubCategory = (e) => {
    const val = e.target.value;
    setSubCategory((prev) =>
      prev.includes(val) ? prev.filter((item) => item !== val) : [...prev, val]
    );
  };

  useEffect(() => {
    let temp = [...products];

    if (debouncedSearch && debouncedSearch.trim() !== "") {
      const q = debouncedSearch.toLowerCase().trim();
      temp = temp.filter((item) =>
        item.name.toLowerCase().includes(q) ||
        (item.category && item.category.toLowerCase().includes(q)) ||
        (item.subCategory && item.subCategory.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q))
      );
    }

    if (category.length) {
      temp = temp.filter((p) => category.includes(p.category));
    }

    if (subCategory.length) {
      temp = temp.filter((p) => subCategory.includes(p.subCategory));
    }

    if (dealsOnly) {
      temp = temp.filter((p) => Number(p.discount) > 0);
    }

    if (bestsellerOnly) {
      temp = temp.filter((p) => p.bestseller);
    }

    // Sort by the price shoppers actually see on the card
    if (sortType === "low-high") {
      temp.sort((a, b) => getStartingPrice(a) - getStartingPrice(b));
    } else if (sortType === "high-low") {
      temp.sort((a, b) => getStartingPrice(b) - getStartingPrice(a));
    } else if (sortType === "discount") {
      temp.sort((a, b) => (b.discount || 0) - (a.discount || 0));
    }

    setFilterProducts(temp);
  }, [category, subCategory, sortType, products, debouncedSearch, dealsOnly, bestsellerOnly]);

  const clearAllFilters = () => {
    setCategory([]);
    setSubCategory([]);
    setDealsOnly(false);
    setBestsellerOnly(false);
    setSearch("");
  };

  return (
    <div className="pt-8 sm:pt-12">
      {/* Active Search / Filter Status Pill */}
      {(search || category.length > 0 || subCategory.length > 0 || dealsOnly || bestsellerOnly) && (
        <div className="mb-6 bg-[#F6F3EC] border border-stone-200 p-3.5 rounded-xs flex flex-wrap items-center justify-between gap-3 text-xs text-stone-700">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-stone-900">Active Filters:</span>
            {search && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-stone-300 rounded-xs text-stone-800">
                Keyword: &ldquo;{search}&rdquo;
                <button type="button" onClick={() => setSearch("")} className="hover:text-stone-950 font-bold ml-1">✕</button>
              </span>
            )}
            {dealsOnly && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-stone-300 rounded-xs text-stone-800">
                On Sale
                <button type="button" aria-label="Remove On Sale filter" onClick={() => setDealsOnly(false)} className="hover:text-stone-950 font-bold ml-1">✕</button>
              </span>
            )}
            {bestsellerOnly && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-stone-300 rounded-xs text-stone-800">
                Bestsellers
                <button type="button" aria-label="Remove Bestsellers filter" onClick={() => setBestsellerOnly(false)} className="hover:text-stone-950 font-bold ml-1">✕</button>
              </span>
            )}
            {category.map((cat) => (
              <span key={cat} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-stone-300 rounded-xs text-stone-800">
                {cat}
                <button type="button" onClick={() => setCategory((prev) => prev.filter((c) => c !== cat))} className="hover:text-stone-950 font-bold ml-1">✕</button>
              </span>
            ))}
            {subCategory.map((sub) => (
              <span key={sub} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-stone-300 rounded-xs text-stone-800">
                {sub}
                <button type="button" onClick={() => setSubCategory((prev) => prev.filter((s) => s !== sub))} className="hover:text-stone-950 font-bold ml-1">✕</button>
              </span>
            ))}
          </div>
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-stone-600 hover:text-stone-950 underline font-medium text-xs cursor-pointer ml-auto"
          >
            Clear All Filters
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Filter Sidebar */}
        <div className="w-full lg:w-64 shrink-0">
          <button
            type="button"
            onClick={() => setShopFilter(!shopFilter)}
            className="w-full flex items-center justify-between lg:justify-start gap-2 py-2 text-xs uppercase tracking-[0.2em] font-semibold text-stone-900 lg:cursor-default"
          >
            <span>DEPARTMENT FILTERS</span>
            <span className="lg:hidden text-stone-500 text-xs font-mono">
              {shopFilter ? "[-]" : "[+]"}
            </span>
          </button>

          <div className={`${shopFilter ? "block" : "hidden"} lg:block space-y-6 mt-4`}>
            {/* Primary Category Filter */}
            <div className="border border-stone-200/90 bg-[#F6F3EC]/50 p-5 rounded-xs">
              <h3 className="font-serif text-xs uppercase tracking-[0.2em] font-semibold text-stone-900 mb-3.5">
                Departments
              </h3>
              <div className="flex flex-col gap-2.5 text-xs text-stone-600 max-h-60 overflow-y-auto pr-1">
                {availableCategories.map((cat) => (
                  <label key={cat} className="flex items-center gap-2.5 cursor-pointer hover:text-stone-900 transition-colors">
                    <input
                      type="checkbox"
                      value={cat}
                      checked={category.includes(cat)}
                      onChange={toggleCategory}
                      className="w-3.5 h-3.5 accent-stone-900 rounded-xs border-stone-300"
                    />
                    <span className="tracking-wide text-xs">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* SubCategory Filter */}
            <div className="border border-stone-200/90 bg-[#F6F3EC]/50 p-5 rounded-xs">
              <h3 className="font-serif text-xs uppercase tracking-[0.2em] font-semibold text-stone-900 mb-3.5">
                Sub-Categories
              </h3>
              <div className="flex flex-col gap-2.5 text-xs text-stone-600 max-h-60 overflow-y-auto pr-1">
                {availableSubCategories.length === 0 ? (
                  <p className="text-xs text-stone-400 italic">Select a category to view sub-categories</p>
                ) : (
                  availableSubCategories.map((type) => (
                    <label key={type} className="flex items-center gap-2.5 cursor-pointer hover:text-stone-900 transition-colors">
                      <input
                        type="checkbox"
                        value={type}
                        checked={subCategory.includes(type)}
                        onChange={toggleSubCategory}
                        className="w-3.5 h-3.5 accent-stone-900 rounded-xs border-stone-300"
                      />
                      <span className="tracking-wide text-xs">{type}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Product Catalog Display */}
        <div className="flex-1">
          {/* Header & Sorter */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-stone-200/80">
            <div>
              <Title text1="MARKETPLACE" text2="CATALOG" />
              <p className="text-stone-500 text-xs">
                Displaying {filterProducts.length} {filterProducts.length === 1 ? "product" : "products"}
              </p>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <label htmlFor="sortSelect" className="text-[11px] uppercase tracking-wider text-stone-500 hidden sm:inline">
                Sort:
              </label>
              <select
                id="sortSelect"
                value={sortType}
                onChange={(e) => setSortType(e.target.value)}
                className="bg-white border border-stone-300 text-xs px-3.5 py-2 rounded-xs focus:border-stone-900 focus:outline-none tracking-wider text-stone-800 cursor-pointer"
              >
                <option value="relevant">Featured / Relevant</option>
                <option value="low-high">Price: Low to High</option>
                <option value="high-low">Price: High to Low</option>
                <option value="discount">Top Deals &amp; Discounts</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {productsLoading && products.length === 0 ? (
            <div className="py-20 text-center text-stone-400 font-serif text-base">Loading catalog...</div>
          ) : productsError && products.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-stone-300 rounded-xs">
              <p className="font-serif text-lg text-stone-800 mb-2">Catalog unavailable</p>
              <p className="text-xs text-stone-500">{productsError}</p>
            </div>
          ) : filterProducts.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-stone-300 rounded-xs bg-[#F6F3EC]/40">
              <h4 className="font-serif text-lg text-stone-800 mb-2">No Products Match Your Criteria</h4>
              <p className="text-xs text-stone-500 mb-6">Try clearing your filters or searching for another department or keyword.</p>
              <button
                type="button"
                onClick={clearAllFilters}
                className="luxury-btn-primary"
              >
                RESET ALL FILTERS
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 gap-y-8 sm:gap-y-10">
              {filterProducts.map((item, index) => (
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
          )}
        </div>
      </div>
    </div>
  );
}

export default function Collection() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-stone-400 font-serif text-base">Loading catalog...</div>}>
      <CollectionContent />
    </Suspense>
  );
}

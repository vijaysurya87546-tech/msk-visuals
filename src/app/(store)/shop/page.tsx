'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Filter,
  ShoppingCart,
  Zap,
  SlidersHorizontal,
  X,
  ChevronDown,
  Sparkles,
  Frame,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatPrice, cn } from '@/lib/utils';
import { useCartStore } from '@/store/cart';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from '@/lib/mockData';
import type { Product, Category } from '@/lib/types';

function ShopContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const initialCategory = categoryParam === 'printing' ? 'flex' : categoryParam || 'all';
  const initialSearch = searchParams.get('search') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [priceRange, setPriceRange] = useState<number>(5000);
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [showMobileFilter, setShowMobileFilter] = useState<boolean>(false);
  const [addedPopup, setAddedPopup] = useState<string | null>(null);

  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const [prodRes, catRes] = await Promise.all([
        supabase
          .from('products')
          .select('*, images:product_images(*), sizes:product_sizes(*), category:categories(*)')
          .eq('is_active', true)
          .order('sort_order'),
        supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('sort_order'),
      ]);

      setProducts(prodRes.data && prodRes.data.length > 0 ? prodRes.data : INITIAL_PRODUCTS);
      setCategories(catRes.data && catRes.data.length > 0 ? catRes.data : INITIAL_CATEGORIES);
      setLoading(false);
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (initialCategory) setSelectedCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    if (initialSearch) setSearchQuery(initialSearch);
  }, [initialSearch]);

  // Extract all available sizes from products
  const allSizes = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      p.sizes?.forEach((s) => set.add(s.size_label));
    });
    return Array.from(set);
  }, [products]);

  // Filter and sort logic
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category match
      if (selectedCategory !== 'all') {
        const cat = categories.find((c) => c.slug === selectedCategory || c.id === selectedCategory);
        if (cat && p.category_id !== cat.id && (p as any).category?.slug !== selectedCategory) {
          // Check if product's category matches or fallback
          if (!p.name.toLowerCase().includes(cat.name.toLowerCase().split(' ')[0])) {
            return false;
          }
        }
      }

      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesDesc = (p.description || '').toLowerCase().includes(q);
        const matchesMat = (p.material || '').toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesMat) return false;
      }

      // Price filter
      if (p.price > priceRange) return false;

      // Size filter
      if (selectedSize !== 'all') {
        const hasSize = p.sizes?.some((s) => s.size_label === selectedSize);
        if (!hasSize) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'discount') return b.discount_percent - a.discount_percent;
      // Default: newest
      return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
    });
  }, [products, categories, selectedCategory, searchQuery, priceRange, selectedSize, sortBy]);

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    const primaryImg = product.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80';
    const defaultSize = product.sizes?.[0]?.size_label || 'Standard';
    const defaultPrice = product.sizes?.[0]?.price || product.price;
    const defaultMrp = product.sizes?.[0]?.mrp || product.mrp;

    addItem({
      product_id: product.id,
      product_name: product.name,
      product_image: primaryImg,
      size: defaultSize,
      price: defaultPrice,
      mrp: defaultMrp,
      quantity: 1,
      is_customizable: product.is_customizable,
    });

    setAddedPopup(product.id);
    setTimeout(() => setAddedPopup(null), 2000);
  };

  return (
    <div className="min-h-screen py-10 px-4 md:px-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="text-center mb-10 pt-4">
        <span className="text-xs uppercase tracking-[0.3em] text-gold font-semibold">MSK Visuals Catalog</span>
        <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white mt-2">
          Explore Our <span className="text-gold-gradient">Creative Store</span>
        </h1>
        <p className="text-gray-400 text-sm max-w-2xl mx-auto mt-3">
          Discover customized luxury photo frames, divine spiritual designs, artisan resin art, hand-poured soy candles, and high-definition printing.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="card-premium p-4 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search frames, sizes, art..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-premium pl-10 text-sm py-2.5"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <button
            onClick={() => setShowMobileFilter(!showMobileFilter)}
            className="btn-dark lg:hidden text-xs py-2 px-4 flex items-center gap-2"
          >
            <Filter size={14} /> Filters
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#1a1a1a] border border-white/10 rounded-md px-3 py-2 text-xs text-gray-200 outline-none focus:border-gold"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="discount">Highest Discount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Layout: Sidebar Filters + Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <div className={cn("lg:block space-y-6", showMobileFilter ? "block mb-6" : "hidden")}>
          <div className="card-premium p-5 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h2 className="font-heading font-semibold text-white text-base flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-gold" /> Filter Store
              </h2>
              {(selectedCategory !== 'all' || selectedSize !== 'all' || priceRange < 5000 || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedSize('all');
                    setPriceRange(5000);
                    setSearchQuery('');
                  }}
                  className="text-xs text-gold hover:underline"
                >
                  Reset All
                </button>
              )}
            </div>

            {/* Categories */}
            <div>
              <h3 className="label-premium text-xs mb-3">Categories</h3>
              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded text-xs transition-colors flex justify-between items-center",
                    selectedCategory === 'all'
                      ? "bg-gold text-black-deep font-semibold"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <span>All Categories</span>
                  <span>({products.length})</span>
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded text-xs transition-colors flex justify-between items-center",
                      selectedCategory === cat.slug
                        ? "bg-gold text-black-deep font-semibold"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <span className="truncate">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="label-premium text-xs mb-0">Max Price</h3>
                <span className="text-xs text-gold font-semibold">{formatPrice(priceRange)}</span>
              </div>
              <input
                type="range"
                min="100"
                max="5000"
                step="50"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-gold bg-[#222] h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                <span>₹100</span>
                <span>₹5,000+</span>
              </div>
            </div>

            {/* Sizes */}
            {allSizes.length > 0 && (
              <div>
                <h3 className="label-premium text-xs mb-3">Popular Sizes</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedSize('all')}
                    className={cn(
                      "px-2.5 py-1 text-xs rounded border transition-colors",
                      selectedSize === 'all'
                        ? "border-gold bg-gold/20 text-gold"
                        : "border-white/10 text-gray-400 hover:border-gold/40"
                    )}
                  >
                    All
                  </button>
                  {allSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        "px-2.5 py-1 text-xs rounded border transition-colors",
                        selectedSize === size
                          ? "border-gold bg-gold/20 text-gold"
                          : "border-white/10 text-gray-400 hover:border-gold/40"
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Catalog Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="loading-gold w-12 h-12 mb-4" />
              <p className="text-gray-500 text-sm">Loading MSK Visuals collection...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="card-premium p-12 text-center">
              <Frame size={48} className="text-gold/30 mx-auto mb-4" />
              <h3 className="font-heading text-xl text-white mb-2">No Products Found</h3>
              <p className="text-gray-400 text-sm mb-6">
                Try modifying your search or clearing applied filters.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedSize('all');
                  setPriceRange(5000);
                  setSearchQuery('');
                }}
                className="btn-gold"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs text-gray-400">
                  Showing <strong className="text-white">{filteredProducts.length}</strong> creations
                </span>
                <span className="text-xs text-gold/80 flex items-center gap-1">
                  <Sparkles size={12} /> Pan Tamil Nadu Delivery
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => {
                  const primaryImg = product.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80';
                  const availableSizes = product.sizes && product.sizes.length > 0
                    ? product.sizes.map((s) => s.size_label).slice(0, 3).join(', ')
                    : 'Customizable';

                  return (
                    <div
                      key={product.id}
                      className="card-premium overflow-hidden group flex flex-col justify-between"
                    >
                      <Link href={`/product/${product.slug}`} className="block relative">
                        <div className="aspect-square bg-black-elevated relative overflow-hidden">
                          <img
                            src={primaryImg}
                            alt={product.name}
                            className="w-full h-full object-cover img-zoom"
                            loading="lazy"
                          />
                          {product.discount_percent > 0 && (
                            <span className="badge-discount absolute top-3 left-3 shadow-md">
                              {product.discount_percent}% OFF
                            </span>
                          )}
                          {product.is_featured && (
                            <span className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-gold text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded border border-gold/30">
                              Featured
                            </span>
                          )}
                        </div>
                      </Link>

                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="text-[11px] text-gold/80 uppercase tracking-wider mb-1">
                            Sizes: {availableSizes}
                          </div>
                          <Link href={`/product/${product.slug}`}>
                            <h3 className="text-white font-medium text-sm group-hover:text-gold transition-colors line-clamp-2 leading-snug">
                              {product.name}
                            </h3>
                          </Link>
                          {product.short_description && (
                            <p className="text-gray-400 text-xs mt-1.5 line-clamp-2">
                              {product.short_description}
                            </p>
                          )}
                        </div>

                        <div className="mt-4 pt-3 border-t border-white/5">
                          <div className="flex items-baseline justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-gold font-bold text-lg font-heading">
                                {formatPrice(product.price)}
                              </span>
                              {product.mrp > product.price && (
                                <span className="text-gray-500 text-xs line-through">
                                  {formatPrice(product.mrp)}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-green-400 font-medium">In Stock</span>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={(e) => handleQuickAdd(product, e)}
                              className="btn-dark !py-2 !px-3 text-xs w-full flex items-center justify-center gap-1.5"
                            >
                              <ShoppingCart size={13} />
                              {addedPopup === product.id ? 'Added! ✓' : 'Add to Cart'}
                            </button>
                            <Link
                              href={`/product/${product.slug}`}
                              className="btn-gold !py-2 !px-3 text-xs w-full text-center flex items-center justify-center gap-1"
                            >
                              <Zap size={13} /> Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-gold w-10 h-10" />
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, Filter } from 'lucide-react';
import { ProductCard } from '@/components/ecommerce/ProductCard';
import { CartSidebar } from '@/components/ecommerce/CartSidebar';
import { CheckoutWizard } from '@/components/ecommerce/CheckoutWizard';
import { supabase } from '@/lib/supabase';

export const HomieStore: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState([0, 1000]);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, selectedCategory, searchQuery, priceRange]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProducts(data || []);

      // Extract unique categories
      const cats = [...new Set((data || []).map((p) => p.category))].filter(Boolean);
      setCategories(cats);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }

    // Price filter
    filtered = filtered.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);

    setFilteredProducts(filtered);
  };

  const handleAddedToCart = async () => {
    // Update cart count
    const { user } = (await supabase.auth.getSession()).data;
    if (user) {
      const { data } = await supabase
        .from('ecommerce_carts')
        .select('id')
        .eq('user_id', user.id);
      setCartCount(data?.length || 0);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">HS</span>
            </div>
            <h1 className="text-2xl font-bold">HomieStore</h1>
          </div>

          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 hover:bg-gray-100 rounded-lg"
          >
            <ShoppingCart size={24} />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 sticky top-24">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Filter size={20} />
                Filters
              </h3>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="font-semibold text-sm mb-3">Category</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      value="all"
                      checked={selectedCategory === 'all'}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    />
                    <span className="text-sm">All Products</span>
                  </label>
                  {categories.map((cat) => (
                    <label key={cat} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        value={cat}
                        checked={selectedCategory === cat}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                      />
                      <span className="text-sm">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="font-semibold text-sm mb-3">Price Range</h4>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-12">Loading products...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No products found. Try adjusting your filters.
              </div>
            ) : (
              <>
                <div className="mb-4 text-sm text-gray-600">
                  Showing {filteredProducts.length} products
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddedToCart={handleAddedToCart}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Checkout Wizard */}
      <CheckoutWizard
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />
    </div>
  );
};

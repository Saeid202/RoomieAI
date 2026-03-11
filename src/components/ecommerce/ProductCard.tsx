import React, { useState } from 'react';
import { ShoppingCart, Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cartService } from '@/services/ecommerceService';

interface ProductCardProps {
  product: any;
  onAddedToCart?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddedToCart }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      const { user } = (await supabase.auth.getSession()).data;
      if (!user) {
        alert('Please log in to add items to cart');
        return;
      }

      await cartService.addToCart(user.id, product.id, quantity);
      alert('Added to cart!');
      setQuantity(1);
      onAddedToCart?.();
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Failed to add to cart');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden">
      {/* Product Image */}
      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-gray-400">No image</div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 line-clamp-2">{product.name}</h3>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>

        {/* Category */}
        {product.category && (
          <div className="mb-3">
            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
              {product.category}
            </span>
          </div>
        )}

        {/* Price and Stock */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-2xl font-bold text-blue-600">${product.price.toFixed(2)}</div>
            <div className="text-sm text-gray-600">
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </div>
          </div>
          <div className="flex items-center gap-1 text-yellow-400">
            <Star size={16} fill="currentColor" />
            <span className="text-sm text-gray-600">4.5</span>
          </div>
        </div>

        {/* Quantity and Add to Cart */}
        <div className="flex gap-2">
          <div className="flex items-center border rounded-lg">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-2 py-1 text-gray-600 hover:bg-gray-100"
            >
              −
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-12 text-center border-l border-r py-1"
              min="1"
              max={product.stock}
            />
            <button
              onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
              className="px-2 py-1 text-gray-600 hover:bg-gray-100"
            >
              +
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isAdding || product.stock === 0}
            className="flex-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2 py-2 font-medium"
          >
            <ShoppingCart size={18} />
            {isAdding ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

import React from "react";
import { useNavigate } from "react-router-dom";

export const BookSetCard = ({ props }) => {
  const navigate = useNavigate();
  const {
    class: bookClass,
    originalPrice,
    discountedPrice,
    rating,
    name,
    id,
  } = props;

  const discount = originalPrice
    ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
    : 0;

  const handleCardClick = () => {
    if (id) {
      navigate(`/product/${id}`);
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer">
      {/* Image Container */}
      <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 h-40 flex items-center justify-center overflow-hidden">
        <div className="text-center text-blue-600">
          <div className="text-4xl font-bold">{bookClass}</div>
          <div className="text-sm text-blue-500">Standard</div>
        </div>

        {discount > 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {discount}% OFF
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 text-sm truncate mb-2">
          {name || `Class ${bookClass} Book Set`}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-xs">
                ★
              </span>
            ))}
          </div>
          <span className="text-xs text-gray-600">({rating || 4.5})</span>
        </div>

        {/* Pricing */}
        <div className="space-y-1 mb-4">
          <div className="flex gap-2 items-center">
            <span className="text-lg font-bold text-green-600">
              ₹{discountedPrice}
            </span>
            {originalPrice && (
              <span className="text-sm text-gray-400 line-through">
                ₹{originalPrice}
              </span>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors duration-200">
          Add to Cart
        </button>
      </div>
    </div>
  );
};

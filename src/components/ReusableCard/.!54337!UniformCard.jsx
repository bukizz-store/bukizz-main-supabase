import React from "react";
import { useNavigate } from "react-router-dom";

export const UniformCard = ({ props }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (props.id) {
      navigate(`/product/${props.id}`);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
    >
      <div className="relative h-40 bg-gray-200 overflow-hidden">
        <img
          src={props.image}
          alt={props.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
        />
        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
          {props.discount || "Sale"}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2">
          {props.name}
        </h3>
        <p className="text-xs text-gray-500 mb-2">{props.category}</p>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm text-gray-500 line-through">
            ₹{props.originalPrice}
          </span>
          <span className="text-lg font-bold text-gray-900">
            ₹{props.discountedPrice}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-yellow-400">★</span>
          <span className="text-sm text-gray-600">{props.rating}</span>
        </div>
      </div>
    </div>
  );
};

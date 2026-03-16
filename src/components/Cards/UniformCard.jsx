import React from "react";
import { useNavigate } from "react-router-dom";
import { OptimizedImage } from "../Common/OptimizedImage";

export const UniformCard = ({ props }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (props.id) {
      navigate(`/product/${props.id}`, { state: { school: props.school } });
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price);
  };

  const basePrice = props.discountedPrice || props.price || 0;
  const originalPrice = props.originalPrice || 0;
  const discount = originalPrice > basePrice
    ? Math.round(((originalPrice - basePrice) / originalPrice) * 100)
    : 0;

  return (
    <div
      className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:cursor-pointer overflow-hidden border border-gray-100 flex flex-col"
      onClick={handleClick}
    >
      {/* Product Image Container */}
      <div className="relative aspect-[4/5] bg-gray-50 overflow-hidden">
        {/* Heart Icon Overlay */}
        {/* <div className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/50 hover:bg-white text-gray-400 hover:text-red-500 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
          </svg>
        </div> */}

        {(props.image || props.img) ? (
          <OptimizedImage
            src={props.image || props.img}
            alt={props.name || "Product"}
            width={300}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-300 text-xs">No image</span>
          </div>
        )}

        {/* Mobile Rating Badge
        <div className="md:hidden absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-0.5 shadow-sm">
          <span>{props.rating || "4.3"}</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-green-600">
            <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
          </svg>
          <span className="text-gray-400 font-normal ml-0.5">| {props.reviewCount || "434"}</span>
        </div> */}
      </div>

      {/* Product Details */}
      <div className="p-3 flex flex-col gap-1">
        {/* Brand Name */}
        <p className="text-xs md:text-sm font-normal text-gray-500 md:text-gray-800 line-clamp-1">
          {props.brand || props.category || "Brand"}
        </p>

        {/* Product Title */}
        <h3 className="text-xs md:text-[11px] font-bold md:font-medium text-black md:text-gray-500 uppercase tracking-wide truncate">
          {props.name || "Product"}
        </h3>

        {/* Pricing Row */}
        <div className="mt-1 flex items-center flex-wrap gap-2">
          {/* Mobile Layout: Discount -> Original -> Current */}
          <div className="flex md:hidden items-center gap-2 w-full wrap">
            {/* {discount > 0 && (
              <span className="text-xs font-bold text-green-600 flex items-center no-wrap">
                ↓{discount}%
              </span>
            )} */}
            {/* <div className="flex items-center gap-1"> */}
            {discount > 0 && (
              <span className="text-xs text-gray-400 line-through decoration-gray-400">
                {formatPrice(originalPrice)}
              </span>
            )}
            <span className="text-sm font-semibold text-gray-900">
              {formatPrice(basePrice)}
            </span>
            {/* </div> */}
          </div>

          {/* Desktop Layout: Current -> Original -> Discount */}
          <div className="hidden md:flex items-center gap-2 w-full">
            <span className="text-base font-bold text-gray-900">
              {formatPrice(basePrice)}
            </span>
            {discount > 0 && (
              <span className="text-xs text-gray-400 line-through decoration-gray-400">
                {formatPrice(originalPrice)}
              </span>
            )}
            {/* {discount > 0 && (
              <span className="text-xs font-medium text-green-600">
                {discount}% off
              </span>
            )} */}
          </div>
        </div>
      </div>
    </div>
  );
};

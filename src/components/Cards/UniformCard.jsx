import React from "react";
import { useNavigate } from "react-router-dom";
import { OptimizedImage } from "../Common/OptimizedImage";

export const UniformCard = ({ props }) => {
  const navigate = useNavigate();

  const renderStars = () => {
    const rating = parseFloat(props.rating || 4.5);
    const stars = [];

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <img
          key={i}
          className="relative w-[11.41px] h-[10.85px]"
          alt="Star"
          src="/star.svg"
          style={{
            filter: `brightness(0) saturate(100%) ${i <= rating
              ? "invert(33%) sepia(93%) saturate(1969%) hue-rotate(202deg) brightness(96%) contrast(101%)"
              : "invert(88%) sepia(8%) saturate(348%) hue-rotate(202deg) brightness(95%) contrast(88%)"
              }`,
          }}
        />
      );
    }
    return stars;
  };

  const handleClick = () => {
    if (props.id) {
      navigate(`/product/${props.id}`, { state: { school: props.school } });
    }
  };

  const discountPct = props.originalPrice > props.discountedPrice
    ? Math.round(((props.originalPrice - (props.discountedPrice || props.price || 0)) / props.originalPrice) * 100)
    : 0;

  return (
    <div
      className="w-full max-w-[300px] bg-white rounded-[25px] shadow-lg hover:scale-105 transition-transform cursor-pointer overflow-hidden"
      onClick={handleClick}
    >
      {/* Image Section */}
      <div className="relative w-full aspect-[300/194] rounded-t-[25px] overflow-hidden">
        <OptimizedImage
          src={
            props.image ||
            props.img ||
            null
          }
          fallbackSrc="https://via.placeholder.com/300x194/3fa7ff/ffffff?text=Uniform"
          width={400}
          quality={80}
          alt={props.name || "Uniform Item"}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20"></div>

        {/* Product Name Overlay */}
        <div className="absolute bottom-3 left-3 right-3 md:bottom-4 md:left-4 md:right-4">
          <div className="text-white font-bold text-sm md:text-lg leading-tight line-clamp-2">
            {props.name || "School Uniform"}
          </div>
          <div className="text-white/80 text-xs md:text-sm">
            {props.category || "Uniform"}
          </div>
        </div>
      </div>

      {/* Price & Rating Section */}
      <div className="px-4 py-3 md:px-6 md:py-4">
        <div className="flex items-center gap-1.5 flex-wrap">
          {props.originalPrice > (props.discountedPrice || props.price || 0) && (
            <span className="[font-family:'Nunito-Medium',Helvetica] font-medium text-gray-400 text-base md:text-2xl leading-tight tracking-[0] line-through">
              {`₹${props.originalPrice}`}
            </span>
          )}
          <span className="[font-family:'Nunito-Bold',Helvetica] font-bold text-gray-900 text-base md:text-2xl leading-tight tracking-[0]">
            {`₹${props.discountedPrice || props.price || 0}`}
          </span>
        </div>

        {discountPct > 0 && (
          <div className="[font-family:'Nunito-Bold',Helvetica] font-bold text-primaryblue-700 text-sm md:text-2xl tracking-[0] leading-tight mt-1">
            {`${discountPct}% off`}
          </div>
        )}

        {/* Rating */}
        <div className="flex items-center gap-1 mt-1.5">
          <div className="inline-flex items-start gap-1">
            {renderStars()}
          </div>
          <span className="[font-family:'Nunito-Medium',Helvetica] font-medium text-gray-700 text-xs md:text-base leading-tight tracking-[0]">
            {`(${props.rating || 4.5})`}
          </span>
        </div>
      </div>
    </div>
  );
};

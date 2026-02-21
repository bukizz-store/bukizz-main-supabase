import React from "react";
import { useNavigate } from "react-router-dom";

export const BookSetCard = ({ props }) => {
  const navigate = useNavigate();

  const getOrdinalSuffix = (number) => {
    const num = parseInt(number);
    if (isNaN(num)) return number || "";
    if (num >= 11 && num <= 13) return `${num}th`;
    switch (num % 10) {
      case 1:
        return `${num}st`;
      case 2:
        return `${num}nd`;
      case 3:
        return `${num}rd`;
      default:
        return `${num}th`;
    }
  };

  const renderStars = () => {
    const rating = parseFloat(props.rating);
    const stars = [];

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <img
          key={i}
          className="relative w-[6px] h-[5.5px] md:w-[8.5px] md:h-[8px]"
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

  return (
    <div
      className="flex flex-col w-[140px] md:w-[225px] h-full min-h-[160px] md:min-h-[225px] bg-white rounded-[13px] md:rounded-[19px] shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100"
      onClick={handleClick}
    >
      {/* Top Banner (Class Display) */}
      <div className="flex flex-col items-center justify-center p-4 md:p-6 bg-gradient-to-b from-[#39A7FF] to-[#0074D1] text-white flex-shrink-0">
        <div className="font-nunito font-semibold text-white/80 text-xs md:text-sm tracking-widest leading-none mb-1 md:mb-2 uppercase">
          Class
        </div>
        <div className="font-lora font-bold text-2xl md:text-[32px] leading-tight text-center px-2">
          {getOrdinalSuffix((props.class || "").replace("Class ", ""))}
        </div>
      </div>

      <div className="flex flex-col flex-grow justify-between p-3 md:p-4 mt-auto">
        <div className="flex items-center gap-2 flex-wrap">
          <div className={`[font-family:'Nunito-Bold',Helvetica] font-bold text-gray-900 leading-tight tracking-[0] whitespace-nowrap overflow-hidden text-ellipsis ${props.originalPrice >= props.discountedPrice ? 'text-lg md:text-xl' : 'text-sm md:text-lg'}`}>
            {`₹${props.discountedPrice}`}
          </div>

          {props.originalPrice > props.discountedPrice && (
            <div className="[font-family:'Nunito-Medium',Helvetica] font-medium text-gray-400 text-xs md:text-sm leading-tight tracking-[0] whitespace-nowrap overflow-hidden text-ellipsis line-through">
              {`₹${props.originalPrice}`}
            </div>
          )}
        </div>

        {props.originalPrice > props.discountedPrice && (
          <div className="[font-family:'Nunito-Bold',Helvetica] font-bold text-primaryblue-700 text-xs md:text-sm tracking-[0] leading-tight whitespace-nowrap overflow-hidden text-ellipsis mt-1">
            {Math.round(((props.originalPrice - props.discountedPrice) / props.originalPrice) * 100)}% off
          </div>
        )}

        <div className="flex items-center gap-1 mt-2">
          <div className="inline-flex items-center gap-0.5">
            {renderStars()}
          </div>
          <div className="[font-family:'Nunito-Medium',Helvetica] font-medium text-gray-500 text-[10px] md:text-xs leading-tight tracking-[0]">
            {`(${props.rating})`}
          </div>
        </div>
      </div>
    </div>
  );
};

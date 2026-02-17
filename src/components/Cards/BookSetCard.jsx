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
      className="relative w-[140px] h-[151px] md:w-[225px] md:h-[221px] bg-white rounded-[13px] md:rounded-[19px] shadow-lg hover:scale-105 transition-transform cursor-pointer"
      onClick={handleClick}
    >
      <div className="absolute w-[140px] h-[100px] md:w-[225px] md:h-[146px] top-0 left-0 rounded-[13px_13px_0px_0px] md:rounded-[19px_19px_0px_0px] overflow-hidden bg-[linear-gradient(180deg,rgba(57,167,255,1)_0%,rgba(0,116,209,1)_100%)]"></div>
      <div className="flex flex-col w-full h-[65px] md:h-[95px] items-center justify-center gap-[1.5px] md:gap-[2.5px] relative top-[18px] md:top-[26px]">
        <div className="relative w-fit mt-[-0.6px] font-nunito font-semibold text-[#f4f4f4cc] text-base md:text-2xl tracking-[0] leading-[22.4px] md:leading-[33.6px] whitespace-nowrap">
          CLASS
        </div>
        <div className="relative w-fit mt-[-0.6px] [font-family:'Lora-Bold',Helvetica] font-bold text-white text-[25px] md:text-4xl tracking-[0] leading-[34px] md:leading-[50.4px] whitespace-nowrap">
          {getOrdinalSuffix((props.class || "").replace("Class ", ""))}
        </div>
      </div>

      <div className="absolute w-[84px] h-[46px] md:w-[123px] md:h-[68px] top-[104px] md:top-[152px] left-[12px] md:left-[18px]">
        <div className="flex w-[76px] h-[18px] md:w-[112px] md:h-[26px] items-start gap-1 absolute top-0 left-[6px] md:left-[8px]">
          <div className="relative w-[34px] h-[18px] md:w-[50px] md:h-[26px]">
            <div className="relative w-[34px] h-[18px] md:w-[50px] md:h-[26px]">
              <div className="absolute top-0 left-0 [font-family:'Nunito-Medium',Helvetica] font-medium text-gray-400 text-xs md:text-lg leading-[17px] md:leading-[25.2px] tracking-[0] whitespace-nowrap overflow-hidden text-ellipsis [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical] line-through">
                {`₹${props.originalPrice}`}
              </div>
            </div>
          </div>

          <div className="relative w-fit mt-[-0.75px] [font-family:'Nunito-Bold',Helvetica] font-bold text-gray-900 text-xs md:text-lg leading-[17px] md:leading-[25.2px] tracking-[0] whitespace-nowrap overflow-hidden text-ellipsis [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical]">
            {`₹${props.discountedPrice}`}
          </div>
        </div>

        {props.originalPrice > props.discountedPrice && (
          <div className="absolute top-[17px] md:top-[25px] left-[6px] md:left-[8px] [font-family:'Nunito-Bold',Helvetica] font-bold text-primaryblue-700 text-xs md:text-lg tracking-[0] leading-[17px] md:leading-[25.2px] whitespace-nowrap overflow-hidden text-ellipsis [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical]">
            {Math.round(((props.originalPrice - props.discountedPrice) / props.originalPrice) * 100)}% off
          </div>
        )}

        <div className="flex flex-col w-[84px] h-[16px] md:w-[123px] md:h-[23px] items-start gap-0.5 px-1 md:px-2 py-0.5 absolute top-[31px] md:top-[46px] left-0">
          <div className="inline-flex items-center gap-[3px] md:gap-1 relative flex-[0_0_auto]">
            <div className="inline-flex items-start gap-[3px] md:gap-1 relative flex-[0_0_auto]">
              {renderStars()}
            </div>

            <div className="relative w-fit mt-[-0.75px] [font-family:'Nunito-Medium',Helvetica] font-medium text-gray-700 text-[10px] md:text-xs leading-[11px] md:leading-[16.8px] tracking-[0] whitespace-nowrap overflow-hidden text-ellipsis [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical]">
              {`(${props.rating})`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

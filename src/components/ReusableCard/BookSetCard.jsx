import React from "react";
import { useNavigate } from "react-router-dom";

export const BookSetCard = ({ props }) => {
  const navigate = useNavigate();

  const getOrdinalSuffix = (number) => {
    const num = parseInt(number);
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
          className="relative w-[11.41px] h-[10.85px]"
          alt="Star"
          src="/star.svg"
          style={{
            filter: `brightness(0) saturate(100%) ${
              i <= rating
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
      navigate(`/product/${props.id}`);
    }
  };

  return (
    <div
      className="relative w-[300px] h-[295px] bg-white rounded-[25px] shadow-lg hover:scale-105 transition-transform cursor-pointer"
      onClick={handleClick}
    >
      <div className="absolute w-[300px] h-[194px] top-0 left-0 rounded-[25px_25px_0px_0px] overflow-hidden bg-[linear-gradient(180deg,rgba(57,167,255,1)_0%,rgba(0,116,209,1)_100%)]"></div>
      <div className="inline-flex flex-col h-[127px] items-center gap-[3.25px] relative top-[34px] left-[99px]">
        <div className="relative w-fit mt-[-0.81px] font-nunito font-semibold text-[#f4f4f4cc] text-[32px] tracking-[0] leading-[44.8px] whitespace-nowrap">
          CLASS
        </div>
        <div className="relative w-fit mt-[-0.81px] [font-family:'Lora-Bold',Helvetica] font-bold text-white text-[48px] tracking-[0] leading-[67.2px] whitespace-nowrap">
          {getOrdinalSuffix(props.class.replace("Class ", ""))}
        </div>
      </div>

      <div className="absolute w-[164px] h-[91px] top-[202px] left-6">
        <div className="flex w-[149px] h-[34px] items-start gap-1.5 absolute top-0 left-[11px]">
          <div className="relative w-[67px] h-[34px]">
            <div className="relative w-[66px] h-[34px]">
              <div className="absolute top-0 left-0 [font-family:'Nunito-Medium',Helvetica] font-medium text-gray-400 text-2xl leading-[33.6px] tracking-[0] whitespace-nowrap overflow-hidden text-ellipsis [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical] strike-through">
                {`₹ ${props.originalPrice}`}
              </div>
            </div>
          </div>

          <div className="relative w-fit mt-[-1.00px] [font-family:'Nunito-Bold',Helvetica] font-bold text-gray-900 text-2xl leading-[33.6px] tracking-[0] whitespace-nowrap overflow-hidden text-ellipsis [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical]">
            {`₹ ${props.discountedPrice}`}
          </div>
        </div>

        <div className="absolute top-[33px] left-[11px] [font-family:'Nunito-Bold',Helvetica] font-bold text-primaryblue-700 text-2xl tracking-[0] leading-[33.6px] whitespace-nowrap overflow-hidden text-ellipsis [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical]">
          20% off
        </div>

        <div className="flex flex-col w-[164px] h-[30px] items-start gap-0.5 px-3 py-1 absolute top-[61px] left-0">
          <div className="inline-flex items-center gap-1 relative flex-[0_0_auto]">
            <div className="inline-flex items-start gap-1 relative flex-[0_0_auto]">
              {renderStars()}
            </div>

            <div className="relative w-fit mt-[-1.00px] [font-family:'Nunito-Medium',Helvetica] font-medium text-gray-700 text-base leading-[22.4px] tracking-[0] whitespace-nowrap overflow-hidden text-ellipsis [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical]">
              {`(${props.rating})`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

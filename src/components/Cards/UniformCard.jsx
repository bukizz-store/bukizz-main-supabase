import React from "react";
import { useNavigate } from "react-router-dom";

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

  return (
    <div
      className="relative w-[300px] h-[295px] bg-white rounded-[25px] shadow-lg hover:scale-105 transition-transform cursor-pointer"
      onClick={handleClick}
    >
      {/* Image Section - replacing the blue gradient */}
      <div className="absolute w-[300px] h-[194px] top-0 left-0 rounded-[25px_25px_0px_0px] overflow-hidden">
        <img
          src={
            props.image ||
            props.img ||
            "https://via.placeholder.com/300x194/3fa7ff/ffffff?text=Uniform"
          }
          alt={props.name || "Uniform Item"}
          className="w-full h-full object-cover"
        />
        {/* Overlay for better text visibility */}
        <div className="absolute inset-0 bg-black/20"></div>

        {/* Product Name Overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="text-white font-bold text-lg leading-tight">
            {props.name || "School Uniform"}
          </div>
          <div className="text-white/80 text-sm">
            {props.category || "Uniform"}
          </div>
        </div>
      </div>

      {/* Price Section */}
      <div className="absolute w-[164px] h-[91px] top-[202px] left-6">
        <div className="flex w-[149px] h-[34px] items-start gap-1.5 absolute top-0 left-[11px]">
          <div className="relative w-[67px] h-[34px]">
            <div className="relative w-[66px] h-[34px]">
              <div className="absolute top-0 left-0 [font-family:'Nunito-Medium',Helvetica] font-medium text-gray-400 text-2xl leading-[33.6px] tracking-[0] whitespace-nowrap overflow-hidden text-ellipsis line-through">
                {`₹ ${props.originalPrice || 0}`}
              </div>
            </div>
          </div>

          <div className="relative w-fit mt-[-1.00px] [font-family:'Nunito-Bold',Helvetica] font-bold text-gray-900 text-2xl leading-[33.6px] tracking-[0] whitespace-nowrap overflow-hidden text-ellipsis">
            {`₹ ${props.discountedPrice || props.price || 0}`}
          </div>
        </div>

        <div className="absolute top-[33px] left-[11px] [font-family:'Nunito-Bold',Helvetica] font-bold text-primaryblue-700 text-2xl tracking-[0] leading-[33.6px] whitespace-nowrap overflow-hidden text-ellipsis">
          {props.discount || "20% off"}
        </div>

        {/* Rating Section */}
        <div className="flex flex-col w-[164px] h-[30px] items-start gap-0.5 px-3 py-1 absolute top-[61px] left-0">
          <div className="inline-flex items-center gap-1 relative flex-[0_0_auto]">
            <div className="inline-flex items-start gap-1 relative flex-[0_0_auto]">
              {renderStars()}
            </div>

            <div className="relative w-fit mt-[-1.00px] [font-family:'Nunito-Medium',Helvetica] font-medium text-gray-700 text-base leading-[22.4px] tracking-[0] whitespace-nowrap overflow-hidden text-ellipsis">
              {`(${props.rating || 4.5})`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

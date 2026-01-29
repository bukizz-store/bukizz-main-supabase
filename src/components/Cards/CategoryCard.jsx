import React from "react";

const CategoryCard = ({ props, onClick, isSelected = false }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(props.name);
    }
  };

  return (
    <div
      className={`flex-col text-white font-bold w-[125px] h-[125px] md:w-[150px] md:h-[150px] bg-white rounded-2xl shadow-lg flex items-center justify-center font-nunito gap-2 hover:scale-105 transition-all duration-200 hover:cursor-pointer ${isSelected ? "ring-2 ring-blue-400" : ""
        }`}
      onClick={handleClick}
    >
      <img
        src={`/categories/${props.img}`}
        alt={props.name}
        className="w-16 h-16 md:w-20 md:h-20"
      />
      <p className="text-black text-sm md:text-base">{props.name}</p>
    </div>
  );
};

const CategoryCardMobile = ({ props, onClick, isSelected = false }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(props.name);
    }
  };

  return (
    <div
      className="flex flex-col items-center shrink-0 cursor-pointer"
      onClick={() => handleClick()}
    >
      <div
        className={`rounded-full flex items-center justify-center bg-${props.color}-300 shadow-md transition-all duration-300 ${isSelected ? `ring-4 ring-offset-2 ring-${props.color}-400 scale-110` : ""}`}
      >
        <img
          src={`/categories/${props.img}`}
          alt={props.name}
          className="w-14 h-14"
        />
      </div>
      <span className={`text-xs mt-2 text-center text-wrap w-[60px] transition-all duration-300 ${isSelected ? `font-bold text-${props.color}-600` : "text-gray-700"}`}>
        {props.name}
      </span>
    </div>
  );
};

export { CategoryCard, CategoryCardMobile };

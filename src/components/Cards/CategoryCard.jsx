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

export default CategoryCard;

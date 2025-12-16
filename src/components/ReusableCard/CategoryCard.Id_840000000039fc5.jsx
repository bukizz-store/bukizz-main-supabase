import React from "react";

const CategoryCard = ({ props, onClick, isSelected }) => {
  const { name, color, img } = props;

  const colorMap = {
    blue: "bg-blue-100 border-blue-300",
    yellow: "bg-yellow-100 border-yellow-300",
    green: "bg-green-100 border-green-300",
    purple: "bg-purple-100 border-purple-300",
  };

  return (
    <div
      onClick={onClick}
      className={`p-6 rounded-lg cursor-pointer transition-all duration-300 border-2 ${
        isSelected
          ? `${colorMap[color] || "bg-gray-100"} border-2 shadow-lg`
          : "bg-white border-gray-200 hover:shadow-md"
      }`}
    >
      <div className="flex flex-col items-center gap-3">
        {img && (
          <img
            src={`/categories/${img}`}
            alt={name}
            className="w-12 h-12 object-contain"
          />
        )}
        <h3 className="text-lg font-semibold text-gray-800 text-center">
          {name}
        </h3>
      </div>
    </div>
  );
};

export default CategoryCard;

import React from "react";
import CategoryCard from "../Cards/CategoryCard";
const categories = [
  { name: "Book Sets", color: "blue", img: "bookset_cat.svg" },
  { name: "School Uniform", color: "yellow", img: "uniform_cat.svg" },
  { name: "Stationery", color: "green", img: "stationary_cat.svg" },
  { name: "Admissions", color: "purple", img: "admissions_cat.svg" },
  { name: "Categories", color: "pink", img: "categories_cat.svg" },
];

const Category = () => {
  return (
    <div>
      {/* Mobile View */}
      <div className="flex md:hidden overflow-x-auto gap-6 px-4 my-6 no-scrollbar pb-2">
        {categories.map((cat, idx) => (
          <div key={idx} className="flex flex-col items-center shrink-0 pr-4">
            <div
              className={`rounded-full flex items-center justify-center bg-${cat.color}-300 shadow-md `}
            >
              <img
                src={`/categories/${cat.img}`}
                alt={cat.name}
                className="w-24 h-24"
              />
            </div>
            <span className="text-xs font-bold mt-2 text-center text-gray-700">
              {cat.name}
            </span>
          </div>
        ))}
      </div>

      {/* Desktop View */}
      <div className="hidden md:flex flex-wrap justify-center md:justify-around gap-4 my-10">
        {categories.map((cat, idx) => (
          <div
            key={idx}
            className={`flex flex-col items-center justify-center rounded-lg bg-${cat.color}-300`}
          >
            <CategoryCard props={cat} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Category;

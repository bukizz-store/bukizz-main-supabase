import React from "react";
import CategoryCard from "./ReusableCard/CategoryCard";
const categories = [
  { name: "Book Sets", color: "blue" , img:"bookset_cat.svg"},
  { name: "School Uniform", color: "yellow" , img:"uniform_cat.svg" },
  { name: "Stationery", color: "green" , img:"stationary_cat.svg" },
  { name: "Admissions", color: "purple" , img:"admissions_cat.svg" },
  { name: "Categories", color: "pink" , img:"categories_cat.svg" },
];

const Category = () => {
  return (
    <div>
      <div className="flex justify-around my-10 ">
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

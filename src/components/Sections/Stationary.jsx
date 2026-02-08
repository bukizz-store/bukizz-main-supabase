import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useApiRoutesStore from "../../store/apiRoutesStore";

const Stationary = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const apiRoutes = useApiRoutesStore.getState();

      // Check if categories route exists, otherwise fallback or handle error
      let url = apiRoutes.categories?.getAll;
      if (!url) throw new Error("Categories API route not found");

      // Fetch only root categories (parent_id = null)
      url += "?rootOnly=true";

      const response = await fetch(url, {
        headers: apiRoutes.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      const result = await response.json();
      // Assuming result.data contains the { categories, pagination } object
      setCategories(result.data?.categories || []);
      setError("");
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError(err.message);
      // Fallback data if needed, or leave empty
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category) => {
    // Navigate to product list filtered by category slug
    navigate(`/products?category=${category.slug}`, {
      // state: { categorySlug: category.slug, source: "School Essentials" },
    });
  };

  if (loading) {
    return (
      <div className="my-6 mx-4 md:mx-12 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="my-6 mx-4 md:mx-12">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {categories.map((item, idx) => (
          <div
            key={item.id || idx}
            onClick={() => handleCategoryClick(item)}
            className="relative w-full bg-white rounded-2xl shadow-lg hover:scale-105 transition-transform hover:cursor-pointer overflow-hidden flex flex-col"
          >
            <img
              src={item.image || "/placeholder_category.png"} // Fallback image
              alt={item.name}
              className="w-full md:h-[200px] h-[150px] object-cover"
            />
            <div className="px-4 py-3 flex flex-col items-start justify-start gap-1 flex-grow">
              <p className="font-nunito font-semibold text-lg line-clamp-1">{item.name}</p>
              <p className="text-sm text-gray-500 font-nunito line-clamp-2">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Stationary;

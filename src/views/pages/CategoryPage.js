import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useApiRoutesStore from "../../store/apiRoutesStore";
import SearchBar from "../../components/Common/SearchBar";
import Breadcrumb from "../../components/Common/Breadcrumb";
import { handleBackNavigation } from "../../utils/navigation";

const CategoryPage = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { categories: categoryRoutes } = useApiRoutesStore();
    const apiRoutes = useApiRoutesStore.getState();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${categoryRoutes.getAll}?client=web`);
            if (!response.ok) throw new Error("Failed to fetch categories");
            const result = await response.json();
            setCategories(result.data.categories || []);
        } catch (err) {
            console.error("Error fetching categories:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryClick = (category) => {
        // Navigate to product list filtered by category slug
        navigate(`/products?category=${category.slug}`, {
            // state: { categorySlug: category.slug, source: "Category Page" },
        });
    };

    return (
        <div className="min-h-screen bg-[#F3F8FF] flex flex-col">
            <SearchBar />

            <div className="mx-4 md:mx-12 my-8">
                <div className="mb-4">
                    <Breadcrumb
                        items={[
                            { label: "Home", link: "/" },
                            { label: "Categories", link: null },
                        ]}
                    />
                </div>
                <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <button
                                onClick={() => handleBackNavigation(navigate)}
                                className="text-blue-600 hover:text-blue-800 mb-2 flex items-center gap-2"
                            >
                                ← Back
                            </button>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">All Categories</h1>
                            <p className="text-gray-600 mt-1">Explore our wide range of school essentials</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-16">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <h2 className="text-lg font-semibold text-gray-600">Loading categories...</h2>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <p className="text-red-500 text-lg mb-2">Error: {error}</p>
                            <button
                                onClick={fetchCategories}
                                className="mt-2 text-blue-600 hover:underline"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : categories.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">No categories found.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                            {categories.map((category, idx) => (
                                <div
                                    key={category.id || idx}
                                    onClick={() => handleCategoryClick(category)}
                                    className="relative w-full bg-white rounded-2xl shadow-lg hover:scale-105 transition-transform hover:cursor-pointer overflow-hidden flex flex-col"
                                >
                                    <img
                                        src={category.image || "/placeholder_category.png"} // Fallback image
                                        alt={category.name}
                                        className="w-full md:h-[200px] h-[150px] object-cover"
                                    />
                                    <div className="px-4 py-3 flex flex-col items-start justify-start gap-1 flex-grow">
                                        <p className="font-nunito font-semibold text-lg line-clamp-1" title={category.name}>{category.name}</p>
                                        <p className="text-sm text-gray-500 font-nunito line-clamp-2">
                                            {category.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CategoryPage;

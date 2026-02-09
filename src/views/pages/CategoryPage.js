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
            const response = await fetch(categoryRoutes.getAll);
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
        // Navigate to products page with category filter
        navigate(`/product`, {
            state: { categorySlug: category.slug, source: "Category Page" }
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
                                    className="relative w-full bg-white rounded-2xl shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 hover:cursor-pointer border border-gray-100"
                                >
                                    <div className="relative h-[150px] md:h-[180px] w-full overflow-hidden rounded-t-2xl bg-gray-50">
                                        {category.image ? (
                                            <img
                                                src={category.image}
                                                alt={category.name}
                                                className="w-full h-full object-contain p-4"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <span className="text-xs">No Image</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="px-4 py-3 flex flex-col items-start justify-start gap-1 bg-white rounded-b-2xl">
                                        <p className="font-nunito font-semibold text-gray-800 line-clamp-1 w-full" title={category.name}>{category.name}</p>
                                        <p className="text-xs md:text-sm text-green-600 font-nunito font-bold">
                                            Min. 50% Off
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

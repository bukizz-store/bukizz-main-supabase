import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useApiRoutesStore from "../store/apiRoutesStore";
import useAuthStore from "../store/authStore";
import SearchBar from "../../components/Common/SearchBar";

function CategoryProductsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [categorySlug, setCategorySlug] = useState("");
  const [source, setSource] = useState("");

  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/");
      return;
    }

    // Get category slug from route state or URL params
    const state = location.state || {};
    const slug = state.categorySlug || new URLSearchParams(location.search).get("category");

    if (!slug) {
      setError("No category specified");
      setLoading(false);
      return;
    }

    setCategorySlug(slug);
    setSource(state.source || "Products");
    fetchCategoryProducts(slug);
  }, [isAuthenticated, navigate, location]);

  const fetchCategoryProducts = async (slug) => {
    try {
      setLoading(true);
      const apiRoutes = useApiRoutesStore.getState();

      const params = {
        page: currentPage,
        limit: 20,
      };

      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(
        `${apiRoutes.products.byCategory(slug)}?${queryString}`,
        {
          headers: apiRoutes.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch category products");
      }

      const result = await response.json();
      setProducts(result.data?.products || []);
      setTotalPages(result.data?.pagination?.totalPages || 1);
      setTotalProducts(result.data?.pagination?.total || 0);
      setError("");
    } catch (err) {
      console.error("Error fetching category products:", err);
      setError(`Failed to load products: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price);
  };

  const getCategoryName = (slug) => {
    const names = {
      stationary: "Stationery",
      bookset: "Book Set",
      uniform: "Uniform",
      general: "General",
    };
    return names[slug] || slug;
  };

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-[#F3F8FF] flex flex-col">
        <SearchBar />
        <div className="mx-12 my-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-600">
                Loading products...
              </h2>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F8FF] flex flex-col">
      <SearchBar />

      <div className="mx-12 my-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <button
                onClick={() => navigate(-1)}
                className="text-blue-600 hover:text-blue-800 mb-2 flex items-center gap-2"
              >
                ← Back
              </button>
              <h1 className="text-3xl font-bold text-gray-800">
                {getCategoryName(categorySlug)}
              </h1>
              <p className="text-gray-600 mt-2">
                From: {source} ({totalProducts} products)
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Products Grid */}
          {products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {products.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleProductClick(product.id)}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow hover:cursor-pointer overflow-hidden"
                >
                  {/* Product Image */}
                  <div className="relative h-48 bg-gray-100 overflow-hidden">
                    {product.primaryImage ? (
                      <img
                        src={product.primaryImage.url}
                        alt={product.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-400">No image</span>
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                      {product.title}
                    </h3>

                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                      {product.description || "No description"}
                    </p>

                    {/* Price Section */}
                    <div className="mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-gray-900">
                          {formatPrice(product.basePrice)}
                        </span>
                        {product.discount && (
                          <span className="text-sm bg-red-100 text-red-600 px-2 py-1 rounded">
                            {product.discount}% off
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Product Type Badge */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                        {product.productType || "Product"}
                      </span>
                      {!product.is_active && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                          Inactive
                        </span>
                      )}
                    </div>

                    {/* Stock Info */}
                    <div className="text-sm text-gray-600">
                      {product.variants && product.variants.length > 0 ? (
                        <p>
                          {product.variants.reduce((sum, v) => sum + (v.stock || 0), 0)} in stock
                        </p>
                      ) : (
                        <p>{product.stock || 0} in stock</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No products found in this category.
              </p>
              <button
                onClick={() => navigate("/")}
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Go back to home
              </button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-md ${
                    currentPage === page
                      ? "bg-blue-600 text-white"
                      : "border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CategoryProductsPage;

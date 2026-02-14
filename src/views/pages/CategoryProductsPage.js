import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useApiRoutesStore from "../../store/apiRoutesStore";
import SearchBar from "../../components/Common/SearchBar";
import Breadcrumb from "../../components/Common/Breadcrumb";

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

  useEffect(() => {
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
    setSource(state.source || "Products");
    fetchCategoryProducts(slug);
  }, [navigate, location]);

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
      console.log("result", result);
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
    navigate(`/product/${productId}`);
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

      <div className="mx-4 md:mx-12">
        <div className="mb-4">
          <Breadcrumb
            items={[
              { label: "Home", link: "/" },
              { label: "Categories", link: "/category" },
              { label: getCategoryName(categorySlug), link: null },
            ]}
          />
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4 md:p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 capitalize">
                {getCategoryName(categorySlug)}
              </h1>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Products Grid */}
          {products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-8">
              {products.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleProductClick(product.id)}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:cursor-pointer overflow-hidden border border-gray-100 flex flex-col"
                >
                  {/* Product Image Container */}
                  <div className="relative aspect-[4/5] bg-gray-50 overflow-hidden">
                    {/* Heart Icon Overlay (Desktop & Mobile) */}
                    <div className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/50 hover:bg-white text-gray-400 hover:text-red-500 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                      </svg>
                    </div>

                    {product.primaryImage ? (
                      <img
                        src={product.primaryImage.url}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-300 text-xs">No image</span>
                      </div>
                    )}

                    {/* Mobile Rating Badge (Bottom Left of Image) */}
                    <div className="md:hidden absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-0.5 shadow-sm">
                      <span>{product.rating || "4.3"}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-green-600">
                        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-400 font-normal ml-0.5">| {product.reviewCount || "434"}</span>
                    </div>
                  </div>

                  {/* Product Details Wrapper */}
                  <div className="p-3 flex flex-col gap-1">

                    {/* Brand Name */}
                    {/* Mobile: Bold Black Uppercase */}
                    {/* Desktop: Small Gray Uppercase */}
                    <p className="text-xs md:text-[11px] font-bold md:font-medium text-black md:text-gray-500 uppercase tracking-wide">
                      {product.brands && product.brands.length > 0 ? product.brands[0].name : "Brand"}
                    </p>

                    {/* Product Title */}
                    {/* Mobile: Gray, Truncated */}
                    {/* Desktop: Darker, Standard */}
                    <h3 className="text-xs md:text-sm font-normal text-gray-500 md:text-gray-800 line-clamp-1">
                      {product.title}
                    </h3>

                    {/* Pricing Row */}
                    <div className="mt-1 flex items-center flex-wrap gap-2">

                      {/* Mobile Layout: Discount -> Original -> Current */}
                      <div className="flex md:hidden items-center gap-2 w-full">
                        {product.discount > 0 && (
                          <span className="text-xs font-bold text-green-600 flex items-center">
                            ↓ {product.discount}%
                          </span>
                        )}
                        {product.discount > 0 && (
                          <span className="text-xs text-gray-400 line-through decoration-gray-400">
                            {formatPrice(product.basePrice / (1 - product.discount / 100))}
                          </span>
                        )}
                        <span className="text-sm font-semibold text-gray-900">
                          {formatPrice(product.basePrice)}
                        </span>
                      </div>

                      {/* Desktop Layout: Current -> Original -> Discount */}
                      <div className="hidden md:flex items-center gap-2 w-full">
                        <span className="text-base font-bold text-gray-900">
                          {formatPrice(product.basePrice)}
                        </span>
                        {product.discount > 0 && (
                          <span className="text-xs text-gray-400 line-through decoration-gray-400">
                            {formatPrice(product.basePrice / (1 - product.discount / 100))}
                          </span>
                        )}
                        {product.discount > 0 && (
                          <span className="text-xs font-medium text-green-600">
                            {product.discount}% off
                          </span>
                        )}
                      </div>

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
                  className={`px-3 py-2 rounded-md ${currentPage === page
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

import React from "react";
import { useNavigate } from "react-router-dom";

const ProductSearchResults = ({ products, searchTerm }) => {
    const navigate = useNavigate();
    console.log(products);

    if (!products || products.length === 0) {
        return null;
    }

    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`);
    };

    return (
        <div className="my-2">
            <div className="mx-4 md:mx-12 mb-4">
                <p className="text-gray-700 text-lg">
                    Found <span className="font-bold text-blue-600">{products.length}</span>{" "}
                    product{products.length !== 1 ? "s" : ""}
                    {searchTerm && (
                        <span>
                            {" "}
                            matching "<span className="font-semibold">{searchTerm}</span>"
                        </span>
                    )}
                </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 my-4 px-4 mx-0 md:mx-12">
                {products.map((product) => (
                    <div
                        key={product.id}
                        className="flex flex-col items-center justify-center rounded-lg"
                    >
                        <div
                            className="relative w-full bg-white rounded-2xl shadow-lg hover:scale-105 transition-transform hover:cursor-pointer p-3"
                            onClick={() => handleProductClick(product.id)}
                        >
                            <div className="h-[150px] md:h-[200px] w-full flex items-center justify-center bg-gray-50 rounded-xl mb-3 overflow-hidden">
                                <img
                                    src={
                                        product.images?.[0] ||
                                        product.image_url ||
                                        "https://placehold.co/300x300?text=Product"
                                    }
                                    alt={product.title}
                                    className="w-full h-full object-contain mix-blend-multiply"
                                />
                            </div>
                            <div className="px-1">
                                <p className="text-gray-800 font-semibold truncate text-sm md:text-base mb-1">
                                    {product.title}
                                </p>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-lg font-bold text-gray-900">
                                            ₹{product.min_price || product.base_price || 0}
                                        </span>
                                        {(product.min_price || product.base_price) <
                                            ((product.min_price || product.base_price || 0) * 1.2) && (
                                                <span className="text-xs text-gray-500 line-through ml-2">
                                                    ₹{Math.round((product.min_price || product.base_price || 0) * 1.2)}
                                                </span>
                                            )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductSearchResults;

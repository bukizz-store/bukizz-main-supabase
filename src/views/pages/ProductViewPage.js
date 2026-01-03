import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BookSetCard } from "../../components/Cards/BookSetCard";
import { UniformCard } from "../../components/Cards/UniformCard";
import SearchBar from "../../components/Common/SearchBar";
import useUserProfileStore from "../../store/userProfileStore";
import useCartStore from "../../store/cartStore";
import NoProductPage from "../../components/Product/NoProductPage";
import Breadcrumb from "../../components/Common/Breadcrumb";

// ProductViewPage.js
function ProductViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProduct, searchProducts, getSchool, loading, error } = useUserProfileStore();

  const { addToCart, loading: cartLoading, isInCart } = useCartStore();

  const [productData, setProductData] = useState(null);
  const [schoolName, setSchoolName] = useState(null);
  const [currentImages, setCurrentImages] = useState([]);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [loadingImages, setLoadingImages] = useState(false);
  const [productError, setProductError] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({
    option1: null, // Set Type
    option2: null, // Branch
    option3: null, // Optional Subject
  });
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [deliveryPincode, setDeliveryPincode] = useState("");
  const [productOptions, setProductOptions] = useState([]);
  const [showCartDialog, setShowCartDialog] = useState(false);

  // Extract unique option groups from variants
  const extractOptionGroups = (variants) => {
    if (!variants || variants.length === 0) return [];

    const groupsMap = new Map(); // Use position as key

    variants.forEach((v) => {
      // Process option_value_1_ref
      if (v.option_value_1_ref && v.option_value_1_ref.attribute_name) {
        const position = v.option_value_1_ref.attribute_position || 1;
        if (!groupsMap.has(position)) {
          groupsMap.set(position, {
            name: v.option_value_1_ref.attribute_name,
            position: position,
            options: new Map(),
          });
        }
        const group = groupsMap.get(position);
        group.options.set(v.option_value_1_ref.id, {
          id: v.option_value_1_ref.id,
          value: v.option_value_1_ref.value,
          priceModifier: v.option_value_1_ref.price_modifier || 0,
        });
      }

      // Process option_value_2_ref
      if (v.option_value_2_ref && v.option_value_2_ref.attribute_name) {
        const position = v.option_value_2_ref.attribute_position || 2;
        if (!groupsMap.has(position)) {
          groupsMap.set(position, {
            name: v.option_value_2_ref.attribute_name,
            position: position,
            options: new Map(),
          });
        }
        const group = groupsMap.get(position);
        group.options.set(v.option_value_2_ref.id, {
          id: v.option_value_2_ref.id,
          value: v.option_value_2_ref.value,
          priceModifier: v.option_value_2_ref.price_modifier || 0,
        });
      }

      // Process option_value_3_ref
      if (v.option_value_3_ref && v.option_value_3_ref.attribute_name) {
        const position = v.option_value_3_ref.attribute_position || 3;
        if (!groupsMap.has(position)) {
          groupsMap.set(position, {
            name: v.option_value_3_ref.attribute_name,
            position: position,
            options: new Map(),
          });
        }
        const group = groupsMap.get(position);
        group.options.set(v.option_value_3_ref.id, {
          id: v.option_value_3_ref.id,
          value: v.option_value_3_ref.value,
          priceModifier: v.option_value_3_ref.price_modifier || 0,
        });
      }
    });

    // Convert to array and sort by position
    const groups = Array.from(groupsMap.values())
      .sort((a, b) => a.position - b.position)
      .map((group) => ({
        name: group.name,
        position: group.position,
        options: Array.from(group.options.values()),
      }));

    return groups;
  };

  // Update selected variant when options change
  useEffect(() => {
    if (!productData?.variants || productOptions.length === 0) {
      setSelectedVariant(null);
      return;
    }

    console.log("Finding variant for selected options:", selectedOptions);
    console.log("Available variants:", productData.variants);
    console.log("Product options structure:", productOptions);

    // Find variant that matches all selected options
    let matchingVariant = null;

    // Create a more flexible matching system
    for (const variant of productData.variants) {
      let isMatch = true;

      // Check each option position
      for (const optionGroup of productOptions) {
        const selectedOptionId =
          selectedOptions[`option${optionGroup.position}`];

        if (!selectedOptionId) {
          isMatch = false;
          break;
        }

        // Get the option value reference for this position
        let variantOptionId = null;
        if (optionGroup.position === 1) {
          variantOptionId = variant.option_value_1_ref?.id;
        } else if (optionGroup.position === 2) {
          variantOptionId = variant.option_value_2_ref?.id;
        } else if (optionGroup.position === 3) {
          variantOptionId = variant.option_value_3_ref?.id;
        }

        if (variantOptionId !== selectedOptionId) {
          isMatch = false;
          break;
        }
      }

      if (isMatch) {
        matchingVariant = variant;
        console.log("Found matching variant:", matchingVariant);
        break;
      }
    }

    if (!matchingVariant) {
      console.log("No matching variant found for options:", selectedOptions);
    }

    setSelectedVariant(matchingVariant);
  }, [selectedOptions, productData, productOptions]);

  // Fetch product data
  const fetchProductData = useCallback(async () => {
    if (!id) {
      setLoadingProduct(false);
      return;
    }

    try {
      setLoadingProduct(true);
      setProductError(null);

      console.log("Fetching product with ID:", id);
      const product = await getProduct(id);
      console.log("Product data:", product);

      setProductData(product);

      // Process images - use mainImages and imagesByVariant from API response
      if (product.mainImages?.length > 0) {
        setCurrentImages(product.mainImages);
      } else if (product.images?.length > 0) {
        // Fallback to filtering images if mainImages not available
        const mainImages = product.images.filter((img) => !img.variantId);
        setCurrentImages(mainImages);
      }
      setLoadingImages(false);

      // Extract option groups from variants (now with attribute names included)
      if (product.variants?.length > 0) {
        const optionGroups = extractOptionGroups(product.variants);
        setProductOptions(optionGroups);

        // Auto-select first option from available groups based on actual positions
        const initialSelection = {
          option1: null,
          option2: null,
          option3: null,
        };

        // Map positions correctly to option slots
        optionGroups.forEach((group) => {
          if (group.position === 1 && group.options.length > 0) {
            initialSelection.option1 = group.options[0].id;
          } else if (group.position === 2 && group.options.length > 0) {
            initialSelection.option2 = group.options[0].id;
          } else if (group.position === 3 && group.options.length > 0) {
            initialSelection.option3 = group.options[0].id;
          }
        });

        console.log("Setting initial options selection:", initialSelection);
        console.log("Option groups found:", optionGroups);
        setSelectedOptions(initialSelection);
      }

      // Fetch similar products asynchronously (non-blocking)
      if (product.product_type) {
        searchProducts({
          productType: product.product_type,
          limit: 4,
        })
          .then((similarResult) => {
            const filtered =
              similarResult.products?.filter((p) => p.id !== product.id) || [];
            setSimilarProducts(filtered.slice(0, 4));
          })
          .catch((err) => {
            console.error("Error fetching similar products:", err);
            // Don't block main loading for similar products failure
          });
      }

      // Fetch school details if school_id exists
      if (product.school_id) {
        try {
          const school = await getSchool(product.school_id);
          if (school) {
            setSchoolName(school.name);
          }
        } catch (err) {
          console.error("Error fetching school:", err);
        }
      }
    } catch (err) {
      console.error("Error fetching product:", err);
      setProductError(err.message);
    } finally {
      setLoadingProduct(false);
    }
  }, [id, getProduct, searchProducts]);

  useEffect(() => {
    fetchProductData();
  }, [fetchProductData]);

  // Get current price based on selected variant
  const getCurrentPrice = () => {
    if (selectedVariant) {
      // Use the variant's price directly (already calculated on backend)
      const currentPrice =
        selectedVariant.price || productData?.base_price || 0;
      const comparePrice =
        selectedVariant.compare_at_price || currentPrice + 200;

      return {
        current: currentPrice,
        original: comparePrice,
        basePrice: selectedVariant.base_price || productData?.base_price || 0,
        variantPrice: selectedVariant.variant_price || null,
      };
    }

    const basePrice = productData?.base_price || 0;
    return {
      current: basePrice,
      original: basePrice + 200,
      basePrice: basePrice,
      variantPrice: null,
    };
  };

  // Handle option selection
  const handleOptionSelect = (position, optionId) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [`option${position}`]: optionId,
    }));
  };

  // Convert product data to card format
  const getCardProps = (product) => {
    const prices = getCurrentPrice();

    if (product.product_type === "uniform") {
      return {
        name: product.title,
        originalPrice: prices.original,
        discountedPrice: prices.current,
        rating: 4.5,
        category: "School Uniform",
        image:
          product.mainImages?.[0]?.url ||
          product.images?.[0]?.url ||
          "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=200&fit=crop&auto=format",
        discount: "20% off",
      };
    } else {
      // BookSet format
      return {
        class: product.metadata?.grade || "General",
        originalPrice: prices.original,
        discountedPrice: prices.current,
        rating: 4.5,
        name: product.title,
      };
    }
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!productData) return;

    try {
      await addToCart(productData, selectedVariant, selectedQuantity);
      console.log("Item added to cart successfully");
      setShowCartDialog(true);
    } catch (error) {
      console.error("Error adding item to cart:", error);
    }
  };

  const handleContinueShopping = () => {
    setShowCartDialog(false);
  };

  const handleGoToCart = () => {
    setShowCartDialog(false);
    navigate("/checkout");
  };

  // Check if current selection is already in cart
  const itemInCart =
    productData && isInCart(productData.id, selectedVariant?.id);

  // Loading state
  if (loadingProduct || loading) {
    return (
      <div className="min-h-screen bg-[#F3F8FF] flex flex-col relative">
        <SearchBar />
        <div className="mx-12 my-8">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-600">
              Loading product details...
            </h2>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (productError || error) {
    return (
      <div className="min-h-screen bg-[#F3F8FF] flex flex-col relative">
        <SearchBar />
        <div className="mx-12 my-8">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Error Loading Product
            </h2>
            <p className="text-gray-500 mb-4">{productError || error}</p>
            <button
              onClick={() => navigate(-1)}
              className="text-blue-600 hover:underline mt-4 inline-block"
            >
              ← Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Product not found
  if (!productData) {
    return <NoProductPage />;
  }

  const prices = getCurrentPrice();

  return (
    <div className="min-h-screen bg-[#F3F8FF] flex flex-col relative">
      <SearchBar />

      <div className="mx-4 md:mx-12 mt-4">
        <Breadcrumb
          items={[
            { label: "Home", link: "/" },
            ...(schoolName ? [{
              label: schoolName,
              link: productData.school_id ? `/school/${productData.school_id}` : null
            }] : []),
            { label: productData.title, link: null }
          ]}
        />
      </div>

      <div className="mx-4 md:mx-12 my-4 mb-10 max-w flex flex-col md:flex-row gap-8 md:gap-20">
        <div className="flex flex-col-reverse md:flex-row gap-4 justify-start items-start w-full md:w-1/2">
          <div className="flex gap-4 flex-row md:flex-col justify-start items-start overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {currentImages?.slice(0, 5).map((img, idx) => (
              <img
                key={img.id || idx}
                src={img.url || "https://via.placeholder.com/144x144"}
                alt={img.altText || `${productData.title} ${idx + 1}`}
                className="w-20 h-20 md:w-36 md:h-36 object-cover rounded-lg cursor-pointer hover:opacity-80 flex-shrink-0"
              />
            ))}
          </div>
          <div className="flex flex-col justify-start items-start w-full">
            <img
              src={
                currentImages?.[0]?.url ||
                productData?.primaryImage?.url ||
                "https://via.placeholder.com/384x384"
              }
              alt={
                currentImages?.[0]?.altText ||
                productData?.primaryImage?.altText ||
                productData.title
              }
              className="w-full md:w-96 h-[300px] md:h-96 object-cover rounded-lg"
            />
            {loadingImages && (
              <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
        </div>

        <div className="font-nunito w-full md:w-1/2">
          <div className="text-sm text-cyan-300 my-2">
            {(selectedVariant?.stock || 0) > 0 ? "In Stock" : "Out of Stock"}
          </div>
          <div className="flex gap-3">
            <img
              src="/map_svg.svg"
              alt="location"
              className="w-5 h-5 invert-0 brightness-0 saturate-100 text-red-500"
            />
            <p className="text-sm">
              {productData.retailers?.name || "Bukizz Store"}
            </p>
          </div>

          <h1 className="text-4xl font-bold my-4">
            {productData.title}
            {productData.metadata?.grade && (
              <span className="text-2xl text-gray-600 ml-2">
                Class {productData.metadata.grade}
              </span>
            )}
          </h1>

          <div className="flex gap-2 my-1 font-semibold">
            <h2 className="text-3xl text-red-600">
              -
              {Math.round(
                ((prices.original - prices.current) / prices.original) * 100
              )}
              %
            </h2>
            <h2 className="text-3xl">₹ {prices.current}</h2>
          </div>
          <div className="text-xl">
            MRP ₹ {prices.original} (Inclusive of all taxes)
          </div>

          <div className="h-0.5 w-1/2 bg-black my-4"></div>

          {/* Product Options - Separate Groups */}
          {productOptions && productOptions.length > 0 && (
            <div className="my-6">
              <h2 className="text-2xl font-semibold my-4">Select Options</h2>

              {productOptions.map((optionGroup, groupIndex) => (
                <div key={groupIndex} className="mb-6">
                  <h3 className="text-lg font-medium mb-3 text-gray-700">
                    {optionGroup.name}
                  </h3>
                  <div className="flex gap-3 flex-wrap">
                    {optionGroup.options.map((option) => (
                      <button
                        key={option.id}
                        onClick={() =>
                          handleOptionSelect(optionGroup.position, option.id)
                        }
                        className={`px-4 py-2 border rounded-lg transition-all text-sm font-medium ${selectedOptions[`option${optionGroup.position}`] ===
                          option.id
                          ? "bg-blue-500 text-white border-blue-500 shadow-md"
                          : "border-gray-300 hover:bg-gray-50 hover:border-gray-400 text-gray-700"
                          }`}
                      >
                        {option.value}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Selected combination summary */}
              {selectedVariant && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">
                    Selected Combination:
                  </h4>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {productOptions.map((group, idx) => {
                      const selectedOption = group.options.find(
                        (opt) =>
                          opt.id === selectedOptions[`option${group.position}`]
                      );
                      return selectedOption ? (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                        >
                          {selectedOption.value}
                        </span>
                      ) : null;
                    })}
                  </div>
                  <div className="text-sm text-blue-600">
                    <span className="font-medium">Price:</span> ₹
                    {selectedVariant.price} •
                    <span className="font-medium ml-2">Stock:</span>{" "}
                    {selectedVariant.stock || 0} units •
                    <span className="font-medium ml-2">SKU:</span>{" "}
                    {selectedVariant.sku}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quantity Selector */}
          <div className="my-4">
            <h2 className="text-2xl font-semibold my-2">Quantity</h2>
            <div className="flex items-center gap-4">
              <button
                onClick={() =>
                  setSelectedQuantity(Math.max(1, selectedQuantity - 1))
                }
                className="w-10 h-10 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-200"
              >
                -
              </button>
              <span className="text-xl font-semibold">{selectedQuantity}</span>
              <button
                onClick={() => {
                  const maxStock = selectedVariant?.stock || 999;
                  setSelectedQuantity(Math.min(maxStock, selectedQuantity + 1));
                }}
                className="w-10 h-10 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-200"
              >
                +
              </button>
              <span className="text-sm text-gray-500 ml-2">
                Max: {selectedVariant?.stock || "N/A"}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 my-6">
            <button
              onClick={handleAddToCart}
              disabled={
                cartLoading ||
                !selectedVariant ||
                (selectedVariant && selectedVariant.stock < selectedQuantity)
              }
              className={`px-6 py-3 border-2 rounded-full flex items-center gap-2 transition-all ${itemInCart
                ? "bg-green-100 text-green-600 border-green-500"
                : cartLoading
                  ? "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed"
                  : !selectedVariant ||
                    (selectedVariant &&
                      selectedVariant.stock < selectedQuantity)
                    ? "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed"
                    : "text-blue-500 border-blue-500 hover:bg-blue-50"
                }`}
            >
              {cartLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  Adding...
                </>
              ) : itemInCart ? (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Added to Cart
                </>
              ) : (
                <>
                  Add to Cart
                  <img src="/cart_svg.svg" alt="cart" className="w-5 h-5" />
                </>
              )}
            </button>
            <button className="px-6 py-3 bg-sky-500 text-white rounded-full hover:bg-sky-600">
              Buy Now
            </button>
          </div>

          {/* Delivery Section */}
          <div className="my-4">
            <h2 className="text-2xl font-semibold my-2">Delivery & Service</h2>
            <div className="flex gap-4 items-center">
              <input
                type="text"
                placeholder="Enter Delivery Pincode"
                value={deliveryPincode}
                onChange={(e) => setDeliveryPincode(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-700">
                Check
              </button>
            </div>
            <div className="flex gap-2 items-center my-2">
              <img
                src="/delivery_truck.svg"
                alt="delivery truck"
                className="w-6 h-6"
              />
              <p className="text-sm">Delivery by Tomorrow, 11 AM - 1 PM</p>
            </div>

            {/* Product Details */}
            <h2 className="text-2xl font-semibold my-4">Product Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-semibold">Product Type</p>
                <p className="capitalize">{productData.product_type}</p>
                <div className="h-0.5 w-full bg-gray-300 my-2"></div>

                <p className="font-semibold">SKU</p>
                <p>{productData.sku}</p>
                <div className="h-0.5 w-full bg-gray-300 my-2"></div>

                <p className="font-semibold">Currency</p>
                <p>{productData.currency}</p>
                <div className="h-0.5 w-full bg-gray-300 my-2"></div>

                {/* Brands */}
                {productData.brands?.length > 0 && (
                  <>
                    <p className="font-semibold">Brand</p>
                    <p>{productData.brands[0].name}</p>
                    <div className="h-0.5 w-full bg-gray-300 my-2"></div>
                  </>
                )}

                {/* Categories */}
                {productData.categories?.length > 0 && (
                  <>
                    <p className="font-semibold">Category</p>
                    <p>{productData.categories[0].name}</p>
                    <div className="h-0.5 w-full bg-gray-300 my-2"></div>
                  </>
                )}
              </div>
              <div>
                <p className="font-semibold">Retailer</p>
                <p>{productData.retailers?.name || "Bukizz"}</p>
                <div className="h-0.5 w-full bg-gray-300 my-2"></div>

                <p className="font-semibold">Status</p>
                <p
                  className={
                    productData.is_active ? "text-green-600" : "text-red-600"
                  }
                >
                  {productData.is_active ? "Active" : "Inactive"}
                </p>
                <div className="h-0.5 w-full bg-gray-300 my-2"></div>

                {selectedVariant?.stock && (
                  <>
                    <p className="font-semibold">Stock</p>
                    <p>{selectedVariant.stock} units available</p>
                    <div className="h-0.5 w-full bg-gray-300 my-2"></div>
                  </>
                )}

                <p className="font-semibold">Base Price</p>
                <p>₹{productData.base_price}</p>
                <div className="h-0.5 w-full bg-gray-300 my-2"></div>

                {productData.min_price && (
                  <>
                    <p className="font-semibold">Min Price</p>
                    <p>₹{productData.min_price}</p>
                    <div className="h-0.5 w-full bg-gray-300 my-2"></div>
                  </>
                )}
              </div>
            </div>

            {/* Product Description */}
            <h2 className="text-2xl font-semibold my-4">Product Description</h2>
            <p className="text-sm">
              {productData.description ||
                productData.short_description ||
                "No description available."}
            </p>
          </div>
        </div>
      </div>

      {/* Similar Products Section */}
      {similarProducts.length > 0 && (
        <div className="mx-4 md:mx-12 my-10">
          <h2 className="text-2xl font-semibold my-4">Similar Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 items-center justify-center">
            {similarProducts.map((product, idx) => {
              const cardProps = getCardProps(product);

              return (
                <div
                  key={product.id}
                  onClick={() => navigate(`/product/${product.id}`)}
                  className="cursor-pointer"
                >
                  {product.product_type === "uniform" ? (
                    <UniformCard props={cardProps} />
                  ) : (
                    <BookSetCard props={cardProps} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* Cart Confirmation Modal */}
      {showCartDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 animate-fade-in">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Item Added to Cart!
              </h3>
              <p className="text-gray-600">
                {selectedQuantity} x {productData.title} added successfully.
              </p>
            </div>
            <div className="flex flex-col space-y-3">
              <button
                onClick={handleGoToCart}
                className="w-full px-4 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                Go to Cart
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </button>
              <button
                onClick={handleContinueShopping}
                className="w-full px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductViewPage;

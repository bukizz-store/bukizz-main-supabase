import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();
  const { getProduct, searchProducts, loading, error } = useUserProfileStore();

  const { addToCart, loading: cartLoading, isInCart, setBuyNowItem } = useCartStore();

  const [productData, setProductData] = useState(null);
  const [schoolName, setSchoolName] = useState(null);
  const [schoolAddress, setSchoolAddress] = useState(null);
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
          imageUrl: v.option_value_1_ref.imageUrl, // Capture image URL
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
          imageUrl: v.option_value_2_ref.imageUrl, // Capture image URL
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
          imageUrl: v.option_value_3_ref.imageUrl, // Capture image URL
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

      // Check if including school details from location state
      if (location.state?.school) {
        const school = location.state.school;
        console.log("Using school data from navigation state:", school);
        setSchoolName(school.name);

        if (school.address) {
          try {
            const addressData = typeof school.address === 'string'
              ? JSON.parse(school.address)
              : school.address;
            setSchoolAddress(addressData);
          } catch (e) {
            console.error("Error parsing school address:", e);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching product:", err);
      setProductError(err.message);
    } finally {
      setLoadingProduct(false);
    }
  }, [id, getProduct, searchProducts, location.state]);

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
    navigate("/cart");
  };

  // Handle Buy Now - sets item and goes directly to checkout
  const handleBuyNow = () => {
    if (!productData) return;

    try {
      setBuyNowItem(productData, selectedVariant, selectedQuantity);
      navigate("/checkout");
    } catch (error) {
      console.error("Error with Buy Now:", error);
    }
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
    <div className="min-h-screen bg-[#F3F8FF] flex flex-col relative pb-24 md:pb-0">
      <div className="hidden md:block">
        <SearchBar />
      </div>

      {/* Mobile Breadcrumb */}
      {productData && (
        <div className="md:hidden px-4 mt-2 mb-2">
          <Breadcrumb
            items={[
              { label: "Home", link: "/" },
              ...(schoolName
                ? [
                  {
                    label: schoolName,
                    link: productData.school_id
                      ? `/school/${productData.school_id}`
                      : null,
                  },
                ]
                : []),
              { label: productData.title, link: null },
            ]}
          />
        </div>
      )}

      <div className="mx-4 md:mx-12 mb-10 max-w flex flex-col md:flex-row gap-4 md:gap-10">
        <div className="flex flex-col-reverse md:flex-row gap-4 justify-start items-start w-full md:w-[33%]">
          <div className="flex gap-4 flex-row md:flex-col justify-start items-start overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {currentImages?.slice(0, 5).map((img, idx) => (
              <img
                key={img.id || idx}
                src={img.url || "https://via.placeholder.com/144x144"}
                alt={img.altText || `${productData.title} ${idx + 1}`}
                className="w-10 h-10 md:w-20 md:h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 flex-shrink-0"
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
            <div className="hidden md:flex gap-4 my-6">
              <button
                onClick={handleAddToCart}
                disabled={
                  cartLoading ||
                  !selectedVariant ||
                  (selectedVariant && selectedVariant.stock < selectedQuantity)
                }
                className={`px-6 py-3 border-2 rounded-2xl flex items-center gap-2 transition-all ${itemInCart
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
              <button
                onClick={handleBuyNow}
                disabled={
                  !selectedVariant ||
                  (selectedVariant && selectedVariant.stock < selectedQuantity)
                }
                className={`px-12 py-3 rounded-2xl transition-all ${!selectedVariant ||
                  (selectedVariant && selectedVariant.stock < selectedQuantity)
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-sky-500 text-white hover:bg-sky-600"
                  }`}
              >
                ₹ Buy Now
              </button>
            </div>
          </div>

        </div>

        <div className="font-nunito w-full md:w-1/2">
          {/* <div className="text-sm text-cyan-300 my-2">
            {(selectedVariant?.stock || 0) > 0 ? "In Stock" : "Out of Stock"}
          </div>
          <div className="flex gap-3">
            <img
              src="/map_svg.svg"
              alt="location"
              className="w-5 h-5 invert-0 brightness-0 saturate-100 text-red-500"
            />
            <p className="text-sm">
              {productData.warehouses?.[0]?.name || "Bukizz Store"}
            </p>
          </div> */}

          <h1 className="text-2xl font-normal">
            <div className="hidden md:block">
              <Breadcrumb
                items={[
                  { label: "Home", link: "/" },
                  ...(schoolName
                    ? [
                      {
                        label: schoolName,
                        link: productData.school_id
                          ? `/school/${productData.school_id}`
                          : null,
                      },
                    ]
                    : []),
                  { label: productData.title, link: null },
                ]}
              />
            </div>
            {/* School Details */}
            {schoolName && (
              <div className="mb-2 mt-1 block">
                <div className="text-lg text-gray-500 font-semibold leading-tight">
                  {schoolName}
                </div>
                {schoolAddress && (
                  <div className="text-sm text-gray-400 font-normal">
                    {schoolAddress.line1}{schoolAddress.line1 && schoolAddress.city ? ", " : ""}{schoolAddress.city}
                  </div>
                )}
              </div>
            )}
            {productData.title}
            {productData.metadata?.grade && (
              <span className="text-2xl text-gray-600 ml-2">
                Class {productData.metadata.grade}
              </span>
            )}
          </h1>

          <span className="text-sm text-green-600 font-bold">Offer Price</span>
          <div className="flex gap-2 font-semibold">
            <h2 className="text-2xl text-green-600">
              {Math.round(
                ((prices.original - prices.current) / prices.original) * 100
              )}
              %
            </h2>
            <h2 className="text-3xl">₹ {prices.current}</h2>
          </div>
          <div className="text-sm">
            MRP ₹ <span className="line-through">{prices.original}</span> (Inclusive of all taxes)
          </div>

          {/* Product Options - Separate Groups */}
          {productOptions && productOptions.length > 0 && (
            <div className="my-2">
              {productOptions.map((optionGroup, groupIndex) => (
                <div key={groupIndex} className="mb-6 flex gap-4 items-center">
                  <h3 className="text-lg font-medium text-gray-700 whitespace-nowrap">
                    {optionGroup.name}
                  </h3>
                  <div className="flex gap-3 flex-nowrap overflow-x-auto pb-2 w-full no-scrollbar">
                    {optionGroup.options.map((option) => (
                      <div key={option.id} className="flex flex-col items-center">
                        {option.imageUrl ? (
                          // Image-based option rendering
                          <button
                            onClick={() =>
                              handleOptionSelect(optionGroup.position, option.id)
                            }
                            className={`relative w-12 h-12 rounded-full overflow-hidden transition-all flex-shrink-0 ${selectedOptions[`option${optionGroup.position}`] ===
                              option.id
                              ? "ring-2 ring-blue-500 ring-offset-2 scale-105"
                              : "border border-gray-300 hover:border-gray-400"
                              }`}
                            title={option.value}
                          >
                            <img
                              src={option.imageUrl}
                              alt={option.value}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ) : (
                          // Text-based option rendering
                          <button
                            onClick={() =>
                              handleOptionSelect(optionGroup.position, option.id)
                            }
                            className={`px-4 py-2 border rounded-lg transition-all text-sm font-medium whitespace-nowrap flex-shrink-0 ${selectedOptions[`option${optionGroup.position}`] ===
                              option.id
                              ? "bg-blue-500 text-white border-blue-500 shadow-md"
                              : "border-gray-300 hover:bg-gray-50 hover:border-gray-400 text-gray-700"
                              }`}
                          >
                            {option.value}
                          </button>
                        )}
                        {/* Show name below image if it's an image option */}
                        {option.imageUrl && (
                          <span className={`text-xs mt-1 font-medium ${selectedOptions[`option${optionGroup.position}`] === option.id ? "text-blue-600" : "text-gray-600"
                            }`}>
                            {option.value}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Selected combination summary */}
              {/* {selectedVariant && (
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
              )} */}
            </div>
          )}

          {/* Quantity Selector */}
          {/* Quantity Selector */}
          <div className="my-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">Quantity</h2>
              <div className="flex items-center justify-between bg-[#F5F7FA] rounded-xl w-32 p-1.5 shadow-inner">
                <button
                  onClick={() =>
                    setSelectedQuantity(Math.max(1, selectedQuantity - 1))
                  }
                  className="w-10 h-10 rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.05)] flex items-center justify-center text-gray-600 hover:text-blue-600 transition-all text-2xl font-light leading-none active:scale-95"
                >
                  -
                </button>
                <span className="text-xl font-bold text-gray-800 font-nunito">{selectedQuantity}</span>
                <button
                  onClick={() => {
                    const maxStock = selectedVariant?.stock || 999;
                    setSelectedQuantity(Math.min(maxStock, selectedQuantity + 1));
                  }}
                  className="w-10 h-10  rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.05)] flex items-center justify-center text-gray-600 hover:text-blue-600 transition-all text-2xl font-light leading-none active:scale-95"
                >
                  +
                </button>
              </div>
            </div>
            {/* Optional Max Stock Indicator below if needed, keeping it subtle */}
            {/* <div className="text-right text-xs text-gray-400 mt-1 mr-2">
              Max: {selectedVariant?.stock || "N/A"}
            </div> */}
          </div>

          {/* Action Buttons */}


          {/* Delivery Section */}
          {/* Delivery Section */}
          <div className="my-6">
            <h2 className="text-xl font-bold my-3 text-gray-800">Delivery details</h2>
            <div className="bg-white/50 rounded-xl overflow-hidden border border-blue-50">
              {/* Row 1: Pincode */}
              <div className="p-4 border-b border-blue-100 flex items-center justify-between hover:bg-white transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Enter Pincode"
                      value={deliveryPincode}
                      onChange={(e) => setDeliveryPincode(e.target.value)}
                      className="bg-transparent border-none focus:ring-0 p-0 text-gray-800 font-medium placeholder-gray-400 w-28 text-sm"
                    />
                  </div>
                </div>
                <button className="text-blue-600 font-semibold text-sm hover:text-blue-700">
                  Check
                </button>
              </div>

              {/* Row 2: Delivery Estimate */}
              <div className="p-4 border-b border-blue-100 flex items-center gap-3 bg-white/50">
                <img
                  src="/delivery_truck.svg"
                  alt="delivery"
                  className="w-5 h-5 text-gray-600 opacity-70"
                />
                <p className="text-sm font-semibold text-gray-800">
                  Delivery by Tomorrow, 11 AM - 1 PM
                </p>
              </div>

              {/* Row 3: Fulfilled By */}
              <div className="p-4 flex items-center gap-3 bg-white/50">
                <svg className="w-5 h-5 text-gray-600 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <div className="flex flex-col">
                  <p className="text-sm text-gray-800">
                    Fulfilled by <span className="font-semibold">{productData.warehouses?.[0]?.name || "Bukizz Store"}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Product Highlights */}
          <h2 className="text-2xl font-semibold my-4">Product Highlights</h2>
          {productData.highlight ? (
            <div className="grid grid-cols-2 gap-4 text-sm md:text-base">
              {Object.entries(productData.highlight).map(([key, value], index) => (
                <React.Fragment key={index}>
                  <div>
                    <p className="font-semibold capitalize">{key.replace(/_/g, " ")}</p>
                    <p>{value}</p>
                    <div className="h-0.5 w-full bg-gray-300 my-2"></div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          ) : (
            <div className="text-gray-500">No highlights available for this product.</div>
          )}


        </div>
      </div>

      {/* Product Description */}
      <div className="mx-4 md:mx-12 my-4">
        <h2 className="text-2xl font-semibold my-4">Product Description</h2>
        <p className="text-sm">
          {productData.short_description ||
            productData.description ||
            "No description available."}
        </p>
      </div>
      {
        similarProducts.length > 0 && (
          <div className="mx-4 md:mx-12 my-4">
            <h2 className="text-2xl font-semibold my-4">Similar Products</h2>
            <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar md:grid md:grid-cols-4 md:gap-4 md:overflow-visible">
              {similarProducts.map((product, idx) => {
                const cardProps = getCardProps(product);

                return (
                  <div
                    key={product.id}
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="cursor-pointer min-w-[160px] md:min-w-0 flex-shrink-0"
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
        )
      }

      {/* Product Details Section */}
      <div className="mx-4 md:mx-12 my-4">
        <h2 className="text-2xl font-semibold my-4">Product Details</h2>
        <div
          className="text-sm text-gray-700 leading-relaxed bg-white p-6 rounded-xl border border-gray-100 shadow-sm"
          dangerouslySetInnerHTML={{
            __html: productData.description || "No specific details available for this product.",
          }}
        />
      </div>
      {/* Mobile Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] flex gap-4 z-50 md:hidden items-center justify-between border-t border-gray-100">
        <button
          onClick={handleAddToCart}
          disabled={
            cartLoading ||
            !selectedVariant ||
            (selectedVariant && selectedVariant.stock < selectedQuantity)
          }
          className={`flex-1 py-3 border-2 rounded-xl flex items-center justify-center gap-2 transition-all font-semibold ${itemInCart
            ? "bg-green-50 text-green-600 border-green-500"
            : cartLoading
              ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
              : !selectedVariant ||
                (selectedVariant && selectedVariant.stock < selectedQuantity)
                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                : "text-blue-600 border-blue-600 bg-white"
            }`}
        >
          {cartLoading ? (
            "Adding..."
          ) : itemInCart ? (
            "Added"
          ) : (
            "Add to Cart"
          )}
        </button>
        <button
          onClick={handleBuyNow}
          disabled={
            !selectedVariant ||
            (selectedVariant && selectedVariant.stock < selectedQuantity)
          }
          className={`flex-1 py-3 rounded-xl font-semibold shadow-lg transition-all ${!selectedVariant ||
            (selectedVariant && selectedVariant.stock < selectedQuantity)
            ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
            : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200"
            }`}
        >
          Buy Now
        </button>
      </div>

      {/* Cart Confirmation Modal */}
      {
        showCartDialog && (
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
        )
      }
    </div >
  );
}

export default ProductViewPage;

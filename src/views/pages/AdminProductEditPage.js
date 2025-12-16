import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../store/supabaseClient";
import useAuthStore from "../store/authStore";
import useApiRoutesStore from "../store/apiRoutesStore";
import SearchBar from "../../components/Common/SearchBar";

// Import all the modular components
import BasicInfoTab from "../../components/Admin/BasicInfoTab";
import ProductOptionsTab from "../../components/Admin/ProductOptionsTab";
import VariantsTab from "../../components/Admin/VariantsTab";
import AssociationsTab from "../../components/Admin/AssociationsTab";
import ImageManagementTab from "../../components/Admin/ImageManagementTab";
import BrandRetailerTab from "../../components/Admin/BrandRetailerTab";

function AdminProductEditPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Form state - initialized with empty values, will be populated when product loads
  const [formData, setFormData] = useState({
    title: "",
    shortDescription: "",
    description: "",
    sku: "",
    productType: "bookset",
    basePrice: 0,
    currency: "INR",
    isActive: true,
    metadata: {},
    selectedSchools: [],
    selectedCategories: [],
    grade: "1st",
    mandatory: false,
    productImages: [],
    brandData: null,
    retailerData: null,
  });

  // Product Options (up to 3 attributes)
  const [productOptions, setProductOptions] = useState([
    {
      name: "",
      position: 1,
      isRequired: true,
      values: [{ value: "", priceModifier: 0 }],
    },
    {
      name: "",
      position: 2,
      isRequired: true,
      values: [{ value: "", priceModifier: 0 }],
    },
    {
      name: "",
      position: 3,
      isRequired: true,
      values: [{ value: "", priceModifier: 0 }],
    },
  ]);

  // Variants
  const [variants, setVariants] = useState([]);
  const [showVariantGenerator, setShowVariantGenerator] = useState(false);

  // Data from database
  const [schools, setSchools] = useState([]);
  const [categories, setCategories] = useState([]);
  const [retailers, setRetailers] = useState([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("basic");

  // Field validation states
  const [fieldErrors, setFieldErrors] = useState({});
  const [showValidation, setShowValidation] = useState(false);

  // Fetch reference data and product data
  useEffect(() => {
    fetchReferenceData();
    if (id) {
      fetchProductData();
    } else {
      setError("Product ID is required");
      setLoadingProduct(false);
    }
  }, [id]);

  const fetchReferenceData = async () => {
    try {
      // Fetch schools
      const { data: schoolsData, error: schoolsError } = await supabase
        .from("schools")
        .select("id, name, board, city, state")
        .eq("is_active", true)
        .order("name");

      if (schoolsError) throw schoolsError;
      setSchools(schoolsData || []);

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("id, name, slug, description")
        .eq("is_active", true)
        .order("name");

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

      // Fetch retailers
      const { data: retailersData, error: retailersError } = await supabase
        .from("retailers")
        .select("id, name, contact_email, contact_phone, address, website")
        .order("name");

      if (retailersError) throw retailersError;
      setRetailers(retailersData || []);
    } catch (err) {
      console.error("Error fetching reference data:", err);
      setError("Failed to load reference data");
    }
  };

  const fetchProductData = async () => {
    try {
      setLoadingProduct(true);
      const apiRoutes = useApiRoutesStore.getState();

      // Fetch complete product details
      const response = await fetch(
        `http://localhost:3001/api/v1/products/${id}/complete`,
        {
          headers: apiRoutes.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch product");
      }

      const result = await response.json();
      const product = result.data.product;

      console.log("Fetched product data:", result.data); // Debug log

      // Populate form data with proper field mapping
      setFormData({
        title: product.title || "",
        shortDescription:
          product.short_description || product.shortDescription || "", // Handle both field names
        description: product.description || "",
        sku: product.sku || "",
        productType: product.product_type || product.productType || "bookset", // Handle both field names
        basePrice: product.base_price || product.basePrice || 0, // Handle both field names
        currency: product.currency || "INR",
        isActive:
          product.is_active !== undefined
            ? product.is_active
            : product.isActive !== undefined
            ? product.isActive
            : true, // Handle both field names
        metadata: product.metadata || {},
        selectedSchools: product.schoolIds || product.school_ids || [],
        selectedCategories: product.categoryIds || product.category_ids || [],
        grade: product.metadata?.grade || "1st",
        mandatory: product.metadata?.mandatory || false,
        productImages:
          product.images?.map((img) => ({
            id: img.id,
            url: img.url,
            altText: img.alt_text || img.altText,
            sortOrder: img.sort_order || img.sortOrder || 0,
            isPrimary: img.is_primary || img.isPrimary || false,
            imageType: img.image_type || img.imageType || "product",
            variantId: img.variant_id || img.variantId,
            metadata: img.metadata || {},
          })) || [],
        // Fix brand data mapping - handle multiple possible response formats
        brandData: (() => {
          // Check brandDetails first (from complete API response)
          if (product.brandDetails?.[0]) {
            return {
              type: "existing",
              brandId: product.brandDetails[0].id,
              brandDetails: {
                name: product.brandDetails[0].name,
                country: product.brandDetails[0].country,
                logo_url:
                  product.brandDetails[0].logo_url ||
                  product.brandDetails[0].logoUrl,
                slug: product.brandDetails[0].slug,
                description: product.brandDetails[0].description,
              },
            };
          }
          // Check brands array (from basic product response)
          else if (product.brands?.[0]) {
            return {
              type: "existing",
              brandId: product.brands[0].id,
              brandDetails: {
                name: product.brands[0].name,
                country: product.brands[0].country,
                logo_url:
                  product.brands[0].logo_url || product.brands[0].logoUrl,
                slug: product.brands[0].slug,
                description: product.brands[0].description,
              },
            };
          }
          return null;
        })(),
        // Fix retailer data mapping - handle multiple possible response formats
        retailerData: (() => {
          // Check retailerDetails first (from complete API response)
          if (product.retailerDetails) {
            return {
              type: "existing",
              retailerId: product.retailerDetails.id,
              retailerDetails: {
                name: product.retailerDetails.name,
                contact_email:
                  product.retailerDetails.email ||
                  product.retailerDetails.contact_email,
                contact_phone:
                  product.retailerDetails.phone ||
                  product.retailerDetails.contact_phone,
                website: product.retailerDetails.website,
                address: product.retailerDetails.address,
              },
            };
          }
          // Check basic retailer fields
          else if (product.retailerId || product.retailer_id) {
            return {
              type: "existing",
              retailerId: product.retailerId || product.retailer_id,
              retailerDetails: {
                name:
                  product.retailerName ||
                  product.retailer_name ||
                  "Unknown Retailer",
                contact_email:
                  product.retailer_email || product.retailerEmail || "",
                contact_phone:
                  product.retailer_phone || product.retailerPhone || "",
                website:
                  product.retailer_website || product.retailerWebsite || "",
                address:
                  product.retailer_address || product.retailerAddress || "",
              },
            };
          }
          return null;
        })(),
      });

      // Populate variants with proper field mapping
      if (product.variants?.length > 0) {
        setVariants(
          product.variants.map((variant) => ({
            id: variant.id,
            sku: variant.sku,
            price: variant.price || 0,
            compareAtPrice:
              variant.compare_at_price || variant.compareAtPrice || 0, // Handle both field names
            stock: variant.stock || 0,
            weight: variant.weight || 0,
            optionValue1: variant.option_value_1_ref
              ? {
                  value: variant.option_value_1_ref.value,
                  priceModifier: variant.option_value_1_ref.price_modifier || 0,
                }
              : null,
            optionValue2: variant.option_value_2_ref
              ? {
                  value: variant.option_value_2_ref.value,
                  priceModifier: variant.option_value_2_ref.price_modifier || 0,
                }
              : null,
            optionValue3: variant.option_value_3_ref
              ? {
                  value: variant.option_value_3_ref.value,
                  priceModifier: variant.option_value_3_ref.price_modifier || 0,
                }
              : null,
            optionCombination:
              [
                variant.option_value_1_ref?.value,
                variant.option_value_2_ref?.value,
                variant.option_value_3_ref?.value,
              ]
                .filter(Boolean)
                .join(" • ") || "Default",
            metadata: variant.metadata || {},
          }))
        );

        // Extract product options from variants
        extractProductOptionsFromVariants(product.variants);
      }

      setError("");
    } catch (err) {
      console.error("Error fetching product:", err);
      setError(`Failed to load product: ${err.message}`);
    } finally {
      setLoadingProduct(false);
    }
  };

  const extractProductOptionsFromVariants = (variants) => {
    const optionsMap = new Map();

    variants.forEach((variant) => {
      // Process option 1
      if (variant.option_value_1_ref) {
        const key = `${variant.option_value_1_ref.attribute_name}_${variant.option_value_1_ref.attribute_position}`;
        if (!optionsMap.has(key)) {
          optionsMap.set(key, {
            name: variant.option_value_1_ref.attribute_name,
            position: variant.option_value_1_ref.attribute_position || 1,
            isRequired: true,
            values: new Set(),
          });
        }
        optionsMap.get(key).values.add({
          value: variant.option_value_1_ref.value,
          priceModifier: variant.option_value_1_ref.price_modifier || 0,
        });
      }

      // Process option 2
      if (variant.option_value_2_ref) {
        const key = `${variant.option_value_2_ref.attribute_name}_${variant.option_value_2_ref.attribute_position}`;
        if (!optionsMap.has(key)) {
          optionsMap.set(key, {
            name: variant.option_value_2_ref.attribute_name,
            position: variant.option_value_2_ref.attribute_position || 2,
            isRequired: true,
            values: new Set(),
          });
        }
        optionsMap.get(key).values.add({
          value: variant.option_value_2_ref.value,
          priceModifier: variant.option_value_2_ref.price_modifier || 0,
        });
      }

      // Process option 3
      if (variant.option_value_3_ref) {
        const key = `${variant.option_value_3_ref.attribute_name}_${variant.option_value_3_ref.attribute_position}`;
        if (!optionsMap.has(key)) {
          optionsMap.set(key, {
            name: variant.option_value_3_ref.attribute_name,
            position: variant.option_value_3_ref.attribute_position || 3,
            isRequired: true,
            values: new Set(),
          });
        }
        optionsMap.get(key).values.add({
          value: variant.option_value_3_ref.value,
          priceModifier: variant.option_value_3_ref.price_modifier || 0,
        });
      }
    });

    // Convert to array format
    const extractedOptions = Array.from(optionsMap.values())
      .sort((a, b) => a.position - b.position)
      .map((option) => ({
        ...option,
        values: Array.from(option.values),
      }));

    // Ensure we have exactly 3 options (pad with empty ones if needed)
    const paddedOptions = [
      extractedOptions[0] || {
        name: "",
        position: 1,
        isRequired: true,
        values: [{ value: "", priceModifier: 0 }],
      },
      extractedOptions[1] || {
        name: "",
        position: 2,
        isRequired: true,
        values: [{ value: "", priceModifier: 0 }],
      },
      extractedOptions[2] || {
        name: "",
        position: 3,
        isRequired: true,
        values: [{ value: "", priceModifier: 0 }],
      },
    ];

    setProductOptions(paddedOptions);
  };

  // Validate required fields
  const validateFields = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = "Product title is required";
    }
    if (!formData.shortDescription.trim()) {
      errors.shortDescription = "Short description is required";
    }
    if (!formData.basePrice || formData.basePrice <= 0) {
      errors.basePrice = "Base price must be greater than 0";
    }

    if (formData.title.length > 100) {
      errors.title = "Product title must be less than 100 characters";
    }
    if (formData.shortDescription.length > 500) {
      errors.shortDescription =
        "Short description must be less than 500 characters";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Clear field error when user starts typing
  const clearFieldError = (fieldName) => {
    if (fieldErrors[fieldName]) {
      setFieldErrors((prev) => {
        const updated = { ...prev };
        delete updated[fieldName];
        return updated;
      });
    }
  };

  // Get input class with error styling
  const getInputClassName = (fieldName, baseClass = "") => {
    const hasError = showValidation && fieldErrors[fieldName];
    return `${baseClass} ${
      hasError
        ? "border-red-500 focus:ring-red-500 focus:border-red-500"
        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
    }`;
  };

  // Generate variants from options
  const generateVariants = () => {
    const validOptions = productOptions.filter(
      (opt) => opt.name && opt.values.some((v) => v.value)
    );

    if (validOptions.length === 0) {
      setVariants([
        {
          sku: formData.sku || `${formData.productType.toUpperCase()}-001`,
          price: formData.basePrice,
          compareAtPrice: formData.basePrice + 100,
          stock: 50,
          weight: 0.5,
          optionValue1: null,
          optionValue2: null,
          optionValue3: null,
          optionCombination: "Default",
        },
      ]);
      return;
    }

    const combinations = [];
    const option1Values = validOptions[0]?.values.filter((v) => v.value) || [
      { value: "", priceModifier: 0 },
    ];
    const option2Values = validOptions[1]?.values.filter((v) => v.value) || [
      { value: "", priceModifier: 0 },
    ];
    const option3Values = validOptions[2]?.values.filter((v) => v.value) || [
      { value: "", priceModifier: 0 },
    ];

    option1Values.forEach((opt1) => {
      option2Values.forEach((opt2) => {
        option3Values.forEach((opt3) => {
          const priceModifier =
            (opt1.priceModifier || 0) +
            (opt2.priceModifier || 0) +
            (opt3.priceModifier || 0);
          const variantPrice = formData.basePrice + priceModifier;

          const skuParts = [
            formData.sku || formData.productType.toUpperCase(),
            opt1.value ? opt1.value.substring(0, 3).toUpperCase() : "",
            opt2.value ? opt2.value.substring(0, 3).toUpperCase() : "",
            opt3.value ? opt3.value.substring(0, 3).toUpperCase() : "",
          ].filter(Boolean);

          combinations.push({
            sku: skuParts.join("-"),
            price: variantPrice,
            compareAtPrice: variantPrice + 100,
            stock: 50,
            weight: 0.5,
            optionValue1: opt1.value
              ? { value: opt1.value, priceModifier: opt1.priceModifier }
              : null,
            optionValue2: opt2.value
              ? { value: opt2.value, priceModifier: opt2.priceModifier }
              : null,
            optionValue3: opt3.value
              ? { value: opt3.value, priceModifier: opt3.priceModifier }
              : null,
            optionCombination:
              [opt1.value, opt2.value, opt3.value]
                .filter(Boolean)
                .join(" • ") || "Default",
          });
        });
      });
    });

    setVariants(combinations);
    setShowVariantGenerator(false);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowValidation(true);

    const isValid = validateFields();

    if (!isValid) {
      setError("Please fill in all required fields correctly");
      const firstErrorField = Object.keys(fieldErrors)[0];
      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField}"]`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          element.focus();
        }
      }
      return;
    }

    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated()) {
      setError(
        "You must be logged in to update products. Please log in and try again."
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const apiRoutes = useApiRoutesStore.getState();

      // Handle brand removal if flagged
      if (formData.removeBrand) {
        try {
          const response = await fetch(
            `http://localhost:3001/api/v1/products/${id}/brands/${formData.removeBrand}`,
            {
              method: "DELETE",
              headers: apiRoutes.getAuthHeaders(),
            }
          );
          if (!response.ok) {
            console.warn("Failed to remove brand, but continuing with update");
          } else {
            console.log("Brand successfully removed from product");
          }
        } catch (err) {
          console.warn("Error removing brand:", err);
        }
      }

      // Handle retailer removal if flagged
      if (formData.removeRetailer) {
        try {
          const response = await fetch(
            `http://localhost:3001/api/v1/products/${id}/retailer`,
            {
              method: "DELETE",
              headers: apiRoutes.getAuthHeaders(),
            }
          );
          if (!response.ok) {
            console.warn(
              "Failed to remove retailer, but continuing with update"
            );
          }
        } catch (err) {
          console.warn("Error removing retailer:", err);
        }
      }

      // Process images: separate existing images (from database) from new images (added in UI)
      const allImages = formData.productImages || [];
      const newImages = allImages.filter((img) => img.isNew === true); // Use isNew flag instead of !img.id
      const existingImages = allImages.filter((img) => img.id && !img.isNew); // Database images with real IDs

      console.log("Processing images:", {
        total: allImages.length,
        new: newImages.length,
        existing: existingImages.length,
        newImageDetails: newImages.map((img) => ({
          tempId: img.tempId,
          url: img.url,
          isNew: img.isNew,
        })),
      });

      const comprehensiveData = {
        productData: {
          title: formData.title,
          shortDescription: formData.shortDescription,
          description: formData.description,
          sku: formData.sku,
          productType: formData.productType,
          basePrice: parseFloat(formData.basePrice),
          currency: formData.currency,
          isActive: formData.isActive,
          metadata: formData.metadata,
        },
        categories: formData.selectedCategories.map((cat) => ({ id: cat })),

        // Only send new images (without database IDs) for upload
        images: newImages.map((image) => ({
          url: image.url,
          file: image.file,
          variantId: image.variantId,
          altText: image.altText,
          sortOrder: image.sortOrder || 0,
          isPrimary: image.isPrimary || false,
          imageType: image.imageType || "product",
          metadata: image.metadata || {},
        })),

        brandData: formData.brandData
          ? {
              type: formData.brandData.type,
              removeExisting: false, // Don't remove existing brands unless explicitly requested
              ...(formData.brandData.type === "existing"
                ? { brandId: formData.brandData.brandId }
                : {
                    name: formData.brandData.name,
                    slug:
                      formData.brandData.slug ||
                      formData.brandData.name
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/(^-|-$)/g, ""),
                    description: formData.brandData.description,
                    country: formData.brandData.country,
                    logoUrl: formData.brandData.logoUrl,
                    metadata: {
                      source: "admin_portal",
                      updatedBy: "admin",
                    },
                  }),
            }
          : null,
        retailerData: formData.retailerData
          ? {
              type: formData.retailerData.type,
              ...(formData.retailerData.type === "existing"
                ? { retailerId: formData.retailerData.retailerId }
                : {
                    name: formData.retailerData.name,
                    contact_email: formData.retailerData.contact_email,
                    contact_phone: formData.retailerData.contact_phone,
                    address: formData.retailerData.address, // Can be text or JSON as per schema
                    website: formData.retailerData.website,
                    is_verified: false, // Default to false for new retailers
                    metadata: {
                      // Store any additional fields that don't exist as columns in metadata JSONB
                      source: "admin_portal",
                      updatedBy: "admin",
                    },
                  }),
            }
          : null,
        variants: variants.map((variant) => ({
          id: variant.id, // Include ID for existing variants
          sku: variant.sku,
          price: variant.price ? parseFloat(variant.price) : null,
          stock: variant.stock ? parseInt(variant.stock) : 0,
          weight: variant.weight ? parseFloat(variant.weight) : 0,
          compareAtPrice: variant.compareAtPrice
            ? parseFloat(variant.compareAtPrice)
            : null,
          optionValueId: variant.optionValueId,
          metadata: variant.metadata || {},
        })),
        replaceVariants: false, // Don't replace variants by default, update existing ones
        replaceImages: false, // Don't replace images by default, add new ones
      };

      console.log(
        "Sending comprehensive product update data:",
        comprehensiveData
      );

      // Use the enhanced API call method with automatic token refresh
      const result = await apiRoutes.put(
        `http://localhost:3001/api/v1/products/${id}/comprehensive`,
        comprehensiveData
      );

      console.log("Comprehensive product update result:", result);

      if (result.data.errors && result.data.errors.length > 0) {
        const warningMessage = `Product updated successfully, but with some warnings:\n${result.data.errors.join(
          "\n"
        )}`;
        setError(warningMessage);
        setSuccess(
          `Product "${result.data.product.title}" updated successfully! (ID: ${result.data.product.id})`
        );
      } else {
        setSuccess(
          `Product "${
            result.data.product.title
          }" updated successfully with all related data! 
          - Product ID: ${result.data.product.id}
          - Images processed: ${result.data.images?.length || 0}
          - Brands associated: ${result.data.brands?.length || 0}
          - Retailer ${result.data.retailer ? "associated" : "not changed"}
          - Variants processed: ${result.data.variants?.length || 0}`
        );
      }

      setError("");

      // Refresh the product data to show updated values
      setTimeout(() => {
        fetchProductData();
      }, 1000);
    } catch (err) {
      console.error("Error updating comprehensive product:", err);
      setError(`Failed to update product: ${err.message}`);
      setSuccess("");
    } finally {
      setLoading(false);
    }
  };

  // Update option attribute
  const updateOption = (index, field, value) => {
    const updated = [...productOptions];
    updated[index] = { ...updated[index], [field]: value };
    setProductOptions(updated);
  };

  // Update option value
  const updateOptionValue = (optionIndex, valueIndex, field, value) => {
    const updated = [...productOptions];
    updated[optionIndex].values[valueIndex] = {
      ...updated[optionIndex].values[valueIndex],
      [field]: field === "priceModifier" ? parseFloat(value) || 0 : value,
    };
    setProductOptions(updated);
  };

  // Add new option value
  const addOptionValue = (optionIndex) => {
    const updated = [...productOptions];
    updated[optionIndex].values.push({ value: "", priceModifier: 0 });
    setProductOptions(updated);
  };

  // Remove option value
  const removeOptionValue = (optionIndex, valueIndex) => {
    const updated = [...productOptions];
    if (updated[optionIndex].values.length > 1) {
      updated[optionIndex].values.splice(valueIndex, 1);
      setProductOptions(updated);
    }
  };

  // Update variant
  const updateVariant = (index, field, value) => {
    const updated = [...variants];
    updated[index] = {
      ...updated[index],
      [field]: ["price", "compareAtPrice", "stock", "weight"].includes(field)
        ? parseFloat(value) || 0
        : value,
    };
    setVariants(updated);
  };

  const tabConfig = [
    { id: "basic", label: "Basic Info" },
    { id: "options", label: "Product Options" },
    { id: "variants", label: "Variants" },
    { id: "associations", label: "Schools & Categories" },
    { id: "images", label: "Images & Media" },
    { id: "branding", label: "Brand & Retailer" },
  ];

  if (loadingProduct) {
    return (
      <div className="min-h-screen bg-[#F3F8FF] flex flex-col">
        <SearchBar />
        <div className="mx-12 my-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-600">
                Loading product details...
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
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              Edit Product - {formData.title}
            </h1>
            <button
              onClick={() => navigate("/admin/products")}
              className="text-blue-600 hover:underline"
            >
              ← Back to Products
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              {success}
            </div>
          )}

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8">
              {tabConfig.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Render appropriate tab component based on activeTab */}
            {activeTab === "basic" && (
              <BasicInfoTab
                formData={formData}
                setFormData={setFormData}
                fieldErrors={fieldErrors}
                showValidation={showValidation}
                clearFieldError={clearFieldError}
                getInputClassName={getInputClassName}
              />
            )}

            {activeTab === "options" && (
              <ProductOptionsTab
                productOptions={productOptions}
                updateOption={updateOption}
                updateOptionValue={updateOptionValue}
                addOptionValue={addOptionValue}
                removeOptionValue={removeOptionValue}
                productId={id}
                onOptionsUpdated={(results) => {
                  console.log("Options updated:", results);
                  // Optionally refresh product data to show updated options
                  // fetchProductData();
                }}
              />
            )}

            {activeTab === "variants" && (
              <VariantsTab
                variants={variants}
                productOptions={productOptions}
                formData={formData}
                showVariantGenerator={showVariantGenerator}
                setShowVariantGenerator={setShowVariantGenerator}
                generateVariants={generateVariants}
                updateVariant={updateVariant}
              />
            )}

            {activeTab === "associations" && (
              <AssociationsTab
                formData={formData}
                setFormData={setFormData}
                schools={schools}
                categories={categories}
              />
            )}

            {activeTab === "images" && (
              <ImageManagementTab
                formData={formData}
                setFormData={setFormData}
                variants={variants}
                productOptions={productOptions}
              />
            )}

            {activeTab === "branding" && (
              <BrandRetailerTab
                formData={formData}
                setFormData={setFormData}
                retailers={retailers}
                productId={id}
              />
            )}

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading || !formData.title || formData.basePrice <= 0}
                className={`px-8 py-3 rounded-md font-medium ${
                  loading || !formData.title || formData.basePrice <= 0
                    ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {loading ? "Updating Product..." : "Update Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminProductEditPage;

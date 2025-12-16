import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../store/supabaseClient";
import useAuthStore from "../../store/authStore";
import useApiRoutesStore from "../../store/apiRoutesStore";
import SearchBar from "../../components/Common/SearchBar";

// Import all the new modular components
import BasicInfoTab from "../../components/Admin/BasicInfoTab";
import ProductOptionsTab from "../../components/Admin/ProductOptionsTab";
import VariantsTab from "../../components/Admin/VariantsTab";
import AssociationsTab from "../../components/Admin/AssociationsTab";
import ImageManagementTab from "../../components/Admin/ImageManagementTab";
import BrandRetailerTab from "../../components/Admin/BrandRetailerTab";

function AdminProductPage() {
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    // Basic Product Info
    title: "",
    shortDescription: "",
    description: "",
    sku: "",
    productType: "bookset",
    basePrice: 0,
    currency: "INR",
    isActive: true,
    metadata: {},

    // Associations
    selectedSchools: [],
    selectedCategories: [],
    grade: "1st",
    mandatory: false,

    // Images, Brands & Retailer
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
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("basic");

  // Field validation states
  const [fieldErrors, setFieldErrors] = useState({});
  const [showValidation, setShowValidation] = useState(false);

  // Fetch reference data
  useEffect(() => {
    fetchReferenceData();
  }, []);

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

  // Validate required fields
  const validateFields = () => {
    const errors = {};

    // Basic Info validation
    if (!formData.title.trim()) {
      errors.title = "Product title is required";
    }
    if (!formData.shortDescription.trim()) {
      errors.shortDescription = "Short description is required";
    }
    if (!formData.basePrice || formData.basePrice <= 0) {
      errors.basePrice = "Base price must be greater than 0";
    }

    // Optional: Add more specific validations
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

  // Generate all possible variants from options
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

    option1Values.forEach((opt1, i1) => {
      option2Values.forEach((opt2, i2) => {
        option3Values.forEach((opt3, i3) => {
          const priceModifier =
            (opt1.priceModifier || 0) +
            (opt2.priceModifier || 0) +
            (opt3.priceModifier || 0);
          const variantPrice = formData.basePrice + priceModifier;

          // Generate SKU based on combination
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

    // Validate all required fields
    const isValid = validateFields();

    if (!isValid) {
      setError("Please fill in all required fields correctly");
      // Scroll to first error field
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

    // Check if user is authenticated
    const { isAuthenticated, getToken } = useAuthStore.getState();
    if (!isAuthenticated()) {
      setError(
        "You must be logged in to create products. Please log in and try again."
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Get API utilities
      const apiRoutes = useApiRoutesStore.getState();

      // Prepare comprehensive product data for atomic creation
      const comprehensiveData = {
        // Core product data
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

        // Categories
        categories: formData.selectedCategories.map((cat) => ({ id: cat })),

        // Images data
        images: (formData.productImages || []).map((image) => ({
          url: image.url,
          file: image.file,
          variantId: image.variantId,
          altText: image.altText,
          sortOrder: image.sortOrder || 0,
          isPrimary: image.isPrimary || false,
          imageType: image.imageType || "product",
          metadata: image.metadata || {},
        })),

        // Brand data with proper schema mapping (no is_primary field)
        brandData: formData.brandData
          ? {
              type: formData.brandData.type,
              ...(formData.brandData.type === "existing"
                ? {
                    brandId: formData.brandData.brandId,
                  }
                : {
                    name: formData.brandData.name,
                    slug: formData.brandData.slug,
                    description: formData.brandData.description,
                    country: formData.brandData.country,
                    logo_url: formData.brandData.logo_url,
                    metadata: {
                      // Store any additional brand metadata
                      source: "admin_portal",
                      createdBy: "admin",
                    },
                  }),
            }
          : null,

        // Retailer data with proper schema mapping (no business_type column)
        retailerData: formData.retailerData
          ? {
              type: formData.retailerData.type,
              ...(formData.retailerData.type === "existing"
                ? {
                    retailerId: formData.retailerData.retailerId,
                  }
                : {
                    name: formData.retailerData.name,
                    contact_email: formData.retailerData.contact_email,
                    contact_phone: formData.retailerData.contact_phone,
                    address: formData.retailerData.address, // Can be text or JSON
                    website: formData.retailerData.website,
                    is_verified: false, // Default to false for new retailers
                    metadata: {
                      // Store additional fields that don't exist as columns in metadata JSONB
                      source: "admin_portal",
                      createdBy: "admin",
                      // Any extra fields can go here since your schema doesn't have them as columns
                    },
                  }),
            }
          : null,

        // Variants data (if any)
        variants: variants.map((variant) => ({
          sku: variant.sku,
          price: variant.price ? parseFloat(variant.price) : null,
          stock: variant.stock ? parseInt(variant.stock) : 0,
          optionValueId: variant.optionValueId,
          metadata: variant.metadata || {},
        })),
      };

      console.log("Sending comprehensive product data:", comprehensiveData);

      // Single atomic API call for comprehensive product creation with proper auth headers
      const response = await fetch(
        "http://localhost:3001/api/v1/products/comprehensive",
        {
          method: "POST",
          headers: apiRoutes.getAuthHeaders(), // This includes the Bearer token
          body: JSON.stringify(comprehensiveData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create product");
      }

      const result = await response.json();

      console.log("Comprehensive product creation result:", result);

      // Check for any partial failures in the result
      if (result.data.errors && result.data.errors.length > 0) {
        const warningMessage = `Product created successfully, but with some warnings:\n${result.data.errors.join(
          "\n"
        )}`;
        setError(warningMessage);

        // Still show success for the main product creation
        setSuccess(
          `Product "${result.data.product.title}" created successfully! (ID: ${result.data.product.id})`
        );
      } else {
        setSuccess(
          `Product "${
            result.data.product.title
          }" created successfully with all related data! 
          - Product ID: ${result.data.product.id}
          - Images uploaded: ${result.data.images?.length || 0}
          - Brands associated: ${result.data.brands?.length || 0}
          - Retailer ${result.data.retailer ? "associated" : "not provided"}
          - Variants created: ${result.data.variants?.length || 0}`
        );
      }

      // Reset the entire form after successful submission
      setFormData({
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

      // Reset validation states
      setFieldErrors({});
      setShowValidation(false);

      // Reset other form states
      setVariants([]);
      setProductOptions([
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

      // Clear any previous errors
      setError("");
    } catch (err) {
      console.error("Error creating comprehensive product:", err);
      setError(`Failed to create product: ${err.message}`);
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

  return (
    <div className="min-h-screen bg-[#F3F8FF] flex flex-col">
      <SearchBar />

      <div className="mx-12 my-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              Add New Product
            </h1>
            <button
              onClick={() => navigate(-1)}
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
                productId={null} // null for new products
              />
            )}

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading || !formData.title || !formData.basePrice}
                className={`px-8 py-3 rounded-md font-medium ${
                  loading || !formData.title || !formData.basePrice
                    ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {loading ? "Creating Product..." : "Create Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminProductPage;

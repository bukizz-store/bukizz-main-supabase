import React, { useState, useEffect } from "react";
import { supabase } from "../../store/supabaseClient";
import useApiRoutesStore from "../../store/apiRoutesStore";

const BrandRetailerTab = ({ formData, setFormData, retailers, productId }) => {
  // Brand state - matching brands schema: id, name, slug, description, country, logo_url, metadata, is_active, created_at, updated_at
  const [brandData, setBrandData] = useState({
    name: "",
    slug: "",
    description: "",
    country: "",
    logo_url: "",
    existingBrandId: "",
  });

  // Retailer state - matching retailers schema: id, name, contact_email, contact_phone, address, website, is_verified, metadata, created_at
  const [retailerData, setRetailerData] = useState({
    name: "",
    contact_email: "",
    contact_phone: "",
    address: "",
    website: "",
    existingRetailerId: "",
  });

  const [brands, setBrands] = useState([]);
  const [fetchedRetailers, setFetchedRetailers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch existing brands and retailers
  useEffect(() => {
    console.log(formData);
    console.log(retailers);
    fetchBrands();
    fetchRetailers();
  }, []);

  const fetchBrands = async () => {
    try {
      const { data, error } = await supabase
        .from("brands")
        .select("id, name, country, logo_url, slug, description")
        .eq("is_active", true)
        .order("name");

      console.log("Fetched brands:", data);

      if (error) throw error;
      setBrands(data || []);
    } catch (err) {
      console.error("Error fetching brands:", err);
    }
  };

  const fetchRetailers = async () => {
    try {
      const { data, error } = await supabase
        .from("retailers")
        .select("id, name, contact_email, contact_phone, address, website")
        .order("name");

      console.log("Fetched retailers:", data);

      if (error) throw error;
      setFetchedRetailers(data || []);
    } catch (err) {
      console.error("Error fetching retailers:", err);
    }
  };

  // Auto-generate slug from name
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  // Update slug when name changes
  const handleBrandNameChange = (name) => {
    setBrandData((prev) => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
  };

  const handleBrandSubmit = async () => {
    if (!brandData.name && !brandData.existingBrandId) {
      setError("Please select an existing brand or enter a new brand name");
      return;
    }

    setLoading(true);
    try {
      if (brandData.existingBrandId) {
        const selectedBrand = brands.find(
          (b) => b.id == brandData.existingBrandId
        );
        setFormData((prev) => ({
          ...prev,
          brandData: {
            type: "existing",
            brandId: brandData.existingBrandId,
            brandDetails: selectedBrand,
          },
        }));
      } else {
        const newBrandData = {
          type: "new",
          name: brandData.name,
          slug: brandData.slug,
          description: brandData.description,
          country: brandData.country,
          logo_url: brandData.logo_url,
        };

        setFormData((prev) => ({
          ...prev,
          brandData: newBrandData,
        }));
      }

      // Reset form
      setBrandData({
        name: "",
        slug: "",
        description: "",
        country: "",
        logo_url: "",
        existingBrandId: "",
      });
      setError("");
    } catch (err) {
      setError(`Failed to add brand: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRetailerSubmit = async () => {
    if (!retailerData.name && !retailerData.existingRetailerId) {
      setError(
        "Please select an existing retailer or enter a new retailer name"
      );
      return;
    }

    setLoading(true);
    try {
      if (retailerData.existingRetailerId) {
        const selectedRetailer = fetchedRetailers.find(
          (r) => r.id == retailerData.existingRetailerId
        );
        console.log("Selected retailer:", selectedRetailer);
        setFormData((prev) => ({
          ...prev,
          retailerData: {
            type: "existing",
            retailerId: retailerData.existingRetailerId,
            retailerDetails: selectedRetailer,
          },
        }));
      } else {
        const newRetailerData = {
          type: "new",
          name: retailerData.name,
          contact_email: retailerData.contact_email,
          contact_phone: retailerData.contact_phone,
          address: retailerData.address,
          website: retailerData.website,
        };

        console.log("New retailer data:", newRetailerData);
        setFormData((prev) => ({
          ...prev,
          retailerData: newRetailerData,
        }));
      }

      // Reset form
      setRetailerData({
        name: "",
        contact_email: "",
        contact_phone: "",
        address: "",
        website: "",
        existingRetailerId: "",
      });
      setError("");
    } catch (err) {
      setError(`Failed to add retailer: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Remove the API call functions and replace with local state management
  const handleRemoveBrand = () => {
    // Set removal flag and clear brand data locally
    setFormData((prev) => ({
      ...prev,
      brandData: null,
      // Add flag to indicate brand should be removed from database - store the actual brandId
      removeBrand: formData.brandData?.brandId || null,
    }));

    console.log(
      "Brand marked for removal (will be applied on update)",
      formData.brandData?.brandId
    );
  };

  const handleRemoveRetailer = () => {
    // Set removal flag and clear retailer data locally
    setFormData((prev) => ({
      ...prev,
      retailerData: null,
      // Add flag to indicate retailer should be removed from database
      removeRetailer: formData.retailerData?.retailerId ? true : false,
    }));

    console.log("Retailer marked for removal (will be applied on update)");
  };

  // Add debug logging to see what's in formData
  useEffect(() => {
    console.log("Current formData:", formData);
    console.log("Current brandData:", formData.brandData);
    console.log("Current retailerData:", formData.retailerData);
  }, [formData]);

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold text-gray-800">
        Brand & Retailer Management
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Brand Management */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-gray-700 mb-4">
          Brand Information
        </h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Existing Brand (Optional)
          </label>
          <select
            value={brandData.existingBrandId}
            onChange={(e) =>
              setBrandData({ ...brandData, existingBrandId: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Create New Brand</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name} ({brand.country})
              </option>
            ))}
          </select>
        </div>

        {!brandData.existingBrandId && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Name *
                </label>
                <input
                  type="text"
                  value={brandData.name}
                  onChange={(e) => handleBrandNameChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Nike, Apple, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Slug (Auto-generated)
                </label>
                <input
                  type="text"
                  value={brandData.slug}
                  onChange={(e) =>
                    setBrandData({ ...brandData, slug: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  placeholder="Auto-generated from name"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Used for URL-friendly brand identification
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  value={brandData.country}
                  onChange={(e) =>
                    setBrandData({ ...brandData, country: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., India, USA, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Logo URL
                </label>
                <input
                  type="url"
                  value={brandData.logo_url}
                  onChange={(e) =>
                    setBrandData({ ...brandData, logo_url: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={brandData.description}
                  onChange={(e) =>
                    setBrandData({ ...brandData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description about the brand..."
                />
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleBrandSubmit}
          disabled={loading}
          className={`mt-4 px-4 py-2 rounded-md font-medium ${
            loading
              ? "bg-gray-400 text-gray-700 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {loading ? "Adding..." : "Add Brand"}
        </button>
      </div>

      {/* Retailer Management */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-gray-700 mb-4">
          Retailer Information
        </h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Existing Retailer (Optional)
          </label>
          <select
            value={retailerData.existingRetailerId}
            onChange={(e) =>
              setRetailerData({
                ...retailerData,
                existingRetailerId: e.target.value,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Create New Retailer</option>
            {fetchedRetailers.map((retailer) => (
              <option key={retailer.id} value={retailer.id}>
                {retailer.name} ({retailer.contact_email})
              </option>
            ))}
          </select>
        </div>

        {!retailerData.existingRetailerId && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Retailer Name *
                </label>
                <input
                  type="text"
                  value={retailerData.name}
                  onChange={(e) =>
                    setRetailerData({ ...retailerData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., ABC Books Store"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={retailerData.contact_email}
                  onChange={(e) =>
                    setRetailerData({
                      ...retailerData,
                      contact_email: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="retailer@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={retailerData.contact_phone}
                  onChange={(e) =>
                    setRetailerData({
                      ...retailerData,
                      contact_phone: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+91 9876543210"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={retailerData.website}
                  onChange={(e) =>
                    setRetailerData({
                      ...retailerData,
                      website: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://retailer-website.com"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  rows={3}
                  value={retailerData.address}
                  onChange={(e) =>
                    setRetailerData({
                      ...retailerData,
                      address: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Complete address (can be JSON object or text)..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Can be a simple text address or JSON object with structured
                  data
                </p>
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleRetailerSubmit}
          disabled={loading}
          className={`mt-4 px-4 py-2 rounded-md font-medium ${
            loading
              ? "bg-gray-400 text-gray-700 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {loading ? "Adding..." : "Add Retailer"}
        </button>
      </div>

      {/* Current Associations Display */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-700 mb-4">
          Current Associations
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Associated Brand</h4>
            {formData.brandData ? (
              <div className="bg-gray-50 p-3 rounded">
                {formData.brandData.type === "existing" ? (
                  <>
                    <p className="font-medium">
                      {formData.brandData.brandDetails?.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formData.brandData.brandDetails?.country}
                    </p>
                    <p className="text-sm text-blue-600">
                      Existing Brand (ID: {formData.brandData.brandId})
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-medium">{formData.brandData.name}</p>
                    <p className="text-sm text-gray-600">
                      Slug: {formData.brandData.slug}
                    </p>
                    {formData.brandData.country && (
                      <p className="text-sm text-gray-600">
                        Country: {formData.brandData.country}
                      </p>
                    )}
                    {formData.brandData.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {formData.brandData.description}
                      </p>
                    )}
                    <p className="text-sm text-green-600">
                      New Brand (will be created)
                    </p>
                  </>
                )}
                <button
                  type="button"
                  onClick={handleRemoveBrand}
                  className="text-xs text-red-600 hover:text-red-800 mt-2"
                >
                  Remove Brand
                </button>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No brand associated</p>
            )}
          </div>

          <div>
            <h4 className="font-medium text-gray-800 mb-2">
              Associated Retailer
            </h4>
            {formData.retailerData ? (
              <div className="bg-gray-50 p-3 rounded">
                {formData.retailerData.type === "existing" ? (
                  <>
                    <p className="font-medium">
                      {formData.retailerData.retailerDetails?.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formData.retailerData.retailerDetails?.contact_email}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formData.retailerData.retailerDetails?.contact_phone}
                    </p>
                    <p className="text-sm text-blue-600">
                      Existing Retailer (ID: {formData.retailerData.retailerId})
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-medium">{formData.retailerData.name}</p>
                    <p className="text-sm text-gray-600">
                      {formData.retailerData.contact_email}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formData.retailerData.contact_phone}
                    </p>
                    {formData.retailerData.website && (
                      <p className="text-sm text-gray-600">
                        Website: {formData.retailerData.website}
                      </p>
                    )}
                    <p className="text-sm text-green-600">
                      New Retailer (will be created)
                    </p>
                  </>
                )}
                <button
                  type="button"
                  onClick={handleRemoveRetailer}
                  className="text-xs text-red-600 hover:text-red-800 mt-2"
                >
                  Remove Retailer
                </button>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No retailer associated</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandRetailerTab;

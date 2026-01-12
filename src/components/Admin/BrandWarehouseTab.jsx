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

  // Warehouse state - matching warehouse schema
  const [warehouseData, setWarehouseData] = useState({
    name: "",
    contact_email: "",
    contact_phone: "",
    address: "",
    website: "",
    existingWarehouseId: "",
  });

  const [brands, setBrands] = useState([]);

  // Retailer state
  const [retailersList, setRetailersList] = useState([]);
  const [selectedRetailerId, setSelectedRetailerId] = useState("");

  const [fetchedWarehouses, setFetchedWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch existing brands and retailers
  useEffect(() => {
    console.log(formData);
    fetchBrands();
    fetchRetailers();

    // Initialize retailer selection if existing in formData (Edit mode)
    if (formData.retailerId) {
      setSelectedRetailerId(formData.retailerId);
    }
  }, [formData.retailerId]); // Add dependency to react to parent loading data

  // Fetch warehouses when retailer is selected
  useEffect(() => {
    if (selectedRetailerId) {
      fetchWarehouses(selectedRetailerId);
    } else {
      setFetchedWarehouses([]);
    }
  }, [selectedRetailerId]);

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
      const apiRoutes = useApiRoutesStore.getState();
      // Admin search for retailers
      const response = await fetch(`${apiRoutes.baseUrl}/users/admin/search?role=retailer&limit=100`, {
        headers: apiRoutes.getAuthHeaders(),
      });
      const result = await response.json();

      if (result.success && result.data && result.data.users) {
        console.log("Fetched retailers:", result.data.users);
        setRetailersList(result.data.users);
      } else {
        console.error("Failed to fetch retailers:", result);
      }
    } catch (err) {
      console.error("Error fetching retailers:", err);
    }
  };

  const fetchWarehouses = async (retailerId) => {
    try {
      setLoading(true);
      const apiRoutes = useApiRoutesStore.getState();
      // Fetch warehouses for specific retailer
      const response = await fetch(`${apiRoutes.baseUrl}/warehouses/retailer/${retailerId}`, {
        headers: apiRoutes.getAuthHeaders(),
      });
      const result = await response.json();

      if (result.success) {
        console.log("Fetched warehouses for retailer:", result.data.warehouses);
        setFetchedWarehouses(result.data.warehouses || []);
      } else {
        throw new Error(result.message || "Failed to fetch warehouses");
      }
    } catch (err) {
      console.error("Error fetching warehouses:", err);
      setFetchedWarehouses([]);
    } finally {
      setLoading(false);
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

  const handleWarehouseSubmit = async () => {
    if (!warehouseData.existingWarehouseId) {
      setError("Please select an existing warehouse");
      return;
    }

    // Ensure retailer is selected
    if (!selectedRetailerId) {
      setError("Please select a retailer first");
      return;
    }

    setLoading(true);
    try {
      const selectedWarehouse = fetchedWarehouses.find(
        (w) => w.id == warehouseData.existingWarehouseId
      );
      const selectedRetailer = retailersList.find(r => r.id === selectedRetailerId);

      console.log("Selected warehouse:", selectedWarehouse);

      setFormData((prev) => ({
        ...prev,
        // Pass retailer/warehouse data to parent
        retailerId: selectedRetailerId,
        warehouseData: {
          type: "existing",
          warehouseId: warehouseData.existingWarehouseId,
          warehouseDetails: selectedWarehouse,
          retailerDetails: selectedRetailer // Optional useful context
        },
      }));

      // Reset form
      setWarehouseData({
        name: "",
        contact_email: "",
        contact_phone: "",
        address: "",
        website: "",
        existingWarehouseId: "",
      });
      // Clear selection after add? Maybe keep retailer selected.
      setError("");
    } catch (err) {
      setError(`Failed to select warehouse: ${err.message}`);
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

  const handleRemoveWarehouse = () => {
    // Set removal flag and clear warehouse data locally
    setFormData((prev) => ({
      ...prev,
      warehouseData: null,
      retailerId: null, // Clear retailer association too
      // Add flag to indicate warehouse should be removed from database
      removeWarehouse: formData.warehouseData?.warehouseId ? true : false,
    }));

    console.log("Warehouse marked for removal (will be applied on update)");
  };

  // Add debug logging to see what's in formData
  useEffect(() => {
    console.log("Current formData:", formData);
    console.log("Current brandData:", formData.brandData);
    console.log("Current warehouseData:", formData.warehouseData);
  }, [formData]);

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold text-gray-800">
        Brand & Warehouse Management
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
          className={`mt-4 px-4 py-2 rounded-md font-medium ${loading
            ? "bg-gray-400 text-gray-700 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
        >
          {loading ? "Adding..." : "Add Brand"}
        </button>
      </div>

      {/* Warehouse Management */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-gray-700 mb-4">
          Warehouse Information
        </h3>

        {/* Retailer Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Retailer *
          </label>
          <select
            value={selectedRetailerId}
            onChange={(e) => {
              setSelectedRetailerId(e.target.value);
              setWarehouseData(prev => ({ ...prev, existingWarehouseId: "" })); // Reset warehouse on retailer change
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Retailer...</option>
            {retailersList.map((retailer) => (
              <option key={retailer.id} value={retailer.id}>
                {retailer.firstName} {retailer.lastName} ({retailer.email})
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Existing Warehouse (Belonging to Retailer)
          </label>
          <select
            value={warehouseData.existingWarehouseId}
            onChange={(e) =>
              setWarehouseData({
                ...warehouseData,
                existingWarehouseId: e.target.value,
              })
            }
            disabled={!selectedRetailerId || loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="">
              {!selectedRetailerId ? "Select a retailer first" : "Select Warehouse..."}
            </option>
            {fetchedWarehouses.map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.name} ({warehouse.contact_email})
              </option>
            ))}
          </select>
          {fetchedWarehouses.length === 0 && selectedRetailerId && !loading && (
            <p className="text-xs text-red-500 mt-1">No warehouses found for this retailer.</p>
          )}
        </div>

        <button
          type="button"
          onClick={handleWarehouseSubmit}
          disabled={loading || !warehouseData.existingWarehouseId}
          className={`mt-4 px-4 py-2 rounded-md font-medium ${loading || !warehouseData.existingWarehouseId
            ? "bg-gray-400 text-gray-700 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
        >
          {loading ? "Adding..." : "Add Warehouse"}
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
              Associated Warehouse
            </h4>
            {formData.warehouseData ? (
              <div className="bg-gray-50 p-3 rounded">
                <p className="font-medium">
                  {formData.warehouseData.warehouseDetails?.name || formData.warehouseData.name}
                </p>
                <p className="text-sm text-gray-600">
                  {formData.warehouseData.warehouseDetails?.contact_email || formData.warehouseData.contact_email}
                </p>
                <p className="text-sm text-gray-600">
                  {formData.warehouseData.warehouseDetails?.contact_phone || formData.warehouseData.contact_phone}
                </p>
                <p className="text-sm text-blue-600">
                  Existing Warehouse (ID: {formData.warehouseData.warehouseId || formData.warehouseData.existingWarehouseId})
                </p>

                <button
                  type="button"
                  onClick={handleRemoveWarehouse}
                  className="text-xs text-red-600 hover:text-red-800 mt-2"
                >
                  Remove Warehouse
                </button>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No warehouse associated</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandRetailerTab;

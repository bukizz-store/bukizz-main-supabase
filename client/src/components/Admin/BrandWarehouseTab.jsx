import React, { useState, useEffect } from "react";
import { supabase } from "../../config/supabaseClient";
import { toast } from "react-hot-toast";
import { Plus, Trash2, Search, Check } from "lucide-react";

const BrandWarehouseTab = ({ formData, setFormData, brands, fetchBrands }) => {
    const [activeTab, setActiveTab] = useState("brand"); // "brand" or "warehouse"
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [fetchedWarehouses, setFetchedWarehouses] = useState([]);

    // Local state for form inputs
    const [brandData, setBrandData] = useState({
        name: "",
        slug: "",
        description: "",
        country: "",
        website: "",
        existingBrandId: "",
    });

    const [warehouseData, setWarehouseData] = useState({
        name: "",
        contact_email: "",
        contact_phone: "",
        address: "",
        website: "",
        existingWarehouseId: "",
    });

    // Fetch warehouses on mount
    useEffect(() => {
        fetchWarehouses();
    }, []);

    const fetchWarehouses = async () => {
        try {
            const { data, error } = await supabase
                .from("warehouse") // Update table name
                .select("id, name, contact_email")
                .order("name");

            console.log("Fetched warehouses:", data);

            if (error) throw error;
            setFetchedWarehouses(data || []);
        } catch (err) {
            console.error("Error fetching warehouses:", err);
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
                if (selectedBrand) {
                    setFormData((prev) => ({
                        ...prev,
                        brandData: {
                            type: "existing",
                            brandId: selectedBrand.id,
                            name: selectedBrand.name,
                        },
                    }));
                }
            } else {
                setFormData((prev) => ({
                    ...prev,
                    brandData: {
                        type: "new",
                        ...brandData,
                    },
                }));
            }

            // Reset form
            setBrandData({
                name: "",
                slug: "",
                description: "",
                country: "",
                website: "",
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
        if (!warehouseData.name && !warehouseData.existingWarehouseId) {
            setError("Please select an existing warehouse or enter a new warehouse name");
            return;
        }

        setLoading(true);
        try {
            if (warehouseData.existingWarehouseId) {
                const selectedWarehouse = fetchedWarehouses.find(
                    (w) => w.id == warehouseData.existingWarehouseId
                );

                console.log("Selected Warehouse:", selectedWarehouse);

                setFormData((prev) => ({
                    ...prev,
                    warehouseData: {
                        type: "existing",
                        warehouseId: warehouseData.existingWarehouseId,
                        ...selectedWarehouse,
                        // If backend needs generic 'details' we can add it, but 'warehouseId' is key
                    },
                }));
            } else {
                const newWarehouseData = {
                    type: "new",
                    name: warehouseData.name,
                    contact_email: warehouseData.contact_email,
                    contact_phone: warehouseData.contact_phone,
                    address: warehouseData.address,
                    website: warehouseData.website,
                };

                console.log("New warehouse data:", newWarehouseData);
                setFormData((prev) => ({
                    ...prev,
                    warehouseData: newWarehouseData,
                }));
            }

            // Reset form
            setWarehouseData({
                name: "",
                contact_email: "",
                contact_phone: "",
                address: "",
                website: "",
                existingWarehouseId: "",
            });
            setError("");
        } catch (err) {
            setError(`Failed to add warehouse: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveBrand = () => {
        setFormData((prev) => ({
            ...prev,
            brandData: null,
        }));
    };

    const handleRemoveWarehouse = () => {
        setFormData((prev) => ({
            ...prev,
            warehouseData: null,
        }));
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex border-b border-gray-200 mb-6">
                    <button
                        className={`px-4 py-2 font-medium text-sm ${activeTab === "brand"
                                ? "border-b-2 border-blue-500 text-blue-600"
                                : "text-gray-500 hover:text-gray-700"
                            }`}
                        onClick={() => setActiveTab("brand")}
                    >
                        Brand Details
                    </button>
                    <button
                        className={`px-4 py-2 font-medium text-sm ${activeTab === "warehouse"
                                ? "border-b-2 border-blue-500 text-blue-600"
                                : "text-gray-500 hover:text-gray-700"
                            }`}
                        onClick={() => setActiveTab("warehouse")}
                    >
                        Warehouse Details
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                        {error}
                    </div>
                )}

                {/* Brand Tab Content */}
                <div className={activeTab === "brand" ? "block" : "hidden"}>
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">
                            Brand Information
                        </h3>

                        {/* Brand Form UI - Mostly unchanged except using state */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Existing Brand
                                </label>
                                <select
                                    value={brandData.existingBrandId}
                                    onChange={(e) =>
                                        setBrandData({
                                            ...brandData,
                                            existingBrandId: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Create New Brand</option>
                                    {brands.map((brand) => (
                                        <option key={brand.id} value={brand.id}>
                                            {brand.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {!brandData.existingBrandId && (
                            <div className="space-y-4 border-t border-gray-100 pt-4 mt-2">
                                <p className="text-sm text-gray-500 font-medium">New Brand Details</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Brand Name
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
                                            readOnly
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Country
                                        </label>
                                        <input
                                            type="text"
                                            value={brandData.country}
                                            onChange={(e) => setBrandData({ ...brandData, country: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Website
                                        </label>
                                        <input
                                            type="text"
                                            value={brandData.website}
                                            onChange={(e) => setBrandData({ ...brandData, website: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={brandData.description}
                                        onChange={(e) => setBrandData({ ...brandData, description: e.target.value })}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={handleBrandSubmit}
                            disabled={loading}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? "Processing..." : "Set Brand Details"}
                        </button>

                        {/* Selected Brand Display */}
                        <div className="mt-6 border-t border-gray-200 pt-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">
                                Currently Selected Brand
                            </h4>
                            {formData.brandData ? (
                                <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-blue-900">
                                                {formData.brandData.name}
                                            </p>
                                            <p className="text-sm text-blue-700">
                                                Type: {formData.brandData.type === "existing" ? "Existing" : "New"}
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleRemoveBrand}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 italic">No brand selected</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Warehouse Tab Content */}
                <div className={activeTab === "warehouse" ? "block" : "hidden"}>
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">
                            Warehouse Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Existing Warehouse
                                </label>
                                <select
                                    value={warehouseData.existingWarehouseId}
                                    onChange={(e) =>
                                        setWarehouseData({
                                            ...warehouseData,
                                            existingWarehouseId: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Create New Warehouse</option>
                                    {fetchedWarehouses.map((warehouse) => (
                                        <option key={warehouse.id} value={warehouse.id}>
                                            {warehouse.name} ({warehouse.contact_email})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {!warehouseData.existingWarehouseId && (
                            <div className="space-y-4 border-t border-gray-100 pt-4 mt-2">
                                <p className="text-sm text-gray-500 font-medium">New Warehouse Details</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Warehouse Name
                                        </label>
                                        <input
                                            type="text"
                                            value={warehouseData.name}
                                            onChange={(e) => setWarehouseData({ ...warehouseData, name: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Contact Email
                                        </label>
                                        <input
                                            type="email"
                                            value={warehouseData.contact_email}
                                            onChange={(e) => setWarehouseData({ ...warehouseData, contact_email: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Contact Phone
                                        </label>
                                        <input
                                            type="text"
                                            value={warehouseData.contact_phone}
                                            onChange={(e) => setWarehouseData({ ...warehouseData, contact_phone: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Website
                                        </label>
                                        <input
                                            type="text"
                                            value={warehouseData.website}
                                            onChange={(e) => setWarehouseData({ ...warehouseData, website: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Address
                                    </label>
                                    <textarea
                                        value={warehouseData.address}
                                        onChange={(e) => setWarehouseData({ ...warehouseData, address: e.target.value })}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Complete address..."
                                    />
                                </div>
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={handleWarehouseSubmit}
                            disabled={loading}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? "Processing..." : "Set Warehouse Details"}
                        </button>

                        {/* Selected Warehouse Display */}
                        <div className="mt-6 border-t border-gray-200 pt-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">
                                Currently Selected Warehouse
                            </h4>
                            {formData.warehouseData ? (
                                <div className="bg-green-50 p-3 rounded-md border border-green-100">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-green-900">
                                                {formData.warehouseData.name}
                                            </p>
                                            <p className="text-sm text-green-700">
                                                Type: {formData.warehouseData.type === "existing" ? "Existing" : "New"}
                                            </p>
                                            {formData.warehouseData.contact_email && (
                                                <p className="text-xs text-green-600 mt-1">{formData.warehouseData.contact_email}</p>
                                            )}
                                        </div>
                                        <button
                                            onClick={handleRemoveWarehouse}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 italic">No warehouse selected</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BrandWarehouseTab;

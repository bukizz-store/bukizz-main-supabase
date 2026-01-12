import React, { useState, useEffect } from "react";
import useAddressStore from "../../store/addressStore";
import useAuthStore from "../../store/authStore";
import useNotificationStore from "../../store/notificationStore";

const AddressManager = () => {
    const {
        addresses,
        loading: addressLoading,
        error: addressError,
        geoLoading,
        fetchAddresses,
        addAddress,
        updateAddress,
        deleteAddress,
        getCurrentLocationAndAddress,
    } = useAddressStore();

    const { showNotification } = useNotificationStore();
    const { setModalOpen } = useAuthStore();

    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);

    const [addressForm, setAddressForm] = useState({
        label: "Home",
        recipientName: "",
        phone: "",
        line1: "",
        line2: "",
        city: "",
        state: "",
        country: "India",
        postalCode: "",
        landmark: "",
    });

    useEffect(() => {
        fetchAddresses();
    }, [fetchAddresses]);

    const handleFormChange = (field, value) => {
        setAddressForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleUseCurrentLocation = async () => {
        try {
            const { location, address } = await getCurrentLocationAndAddress();
            if (address) {
                setAddressForm((prev) => ({
                    ...prev,
                    line1: address.line1 || "",
                    line2: address.line2 || "", // Also populate line2 if available
                    city: address.city || "",
                    state: address.state || "",
                    postalCode: address.postalCode || "",
                    landmark: address.landmark || "", // Populate landmark if available
                }));
                showNotification({
                    message: "Location detected successfully",
                    type: "success",
                });
            }
        } catch (error) {
            showNotification({
                message: "Failed to get current location. Please enter address manually.",
                type: "error",
            });
        }
    };

    const handleCancelForm = () => {
        setShowAddressForm(false);
        setEditingAddress(null);
        setAddressForm({
            label: "Home",
            recipientName: "",
            phone: "",
            line1: "",
            line2: "",
            city: "",
            state: "",
            country: "India",
            postalCode: "",
            landmark: "",
        });
    };

    const handleEditAddress = (address) => {
        setEditingAddress(address);
        setAddressForm({
            label: address.label || "Home",
            recipientName: address.recipientName || "",
            phone: address.phone || "",
            line1: address.line1 || "",
            line2: address.line2 || "",
            city: address.city || "",
            state: address.state || "",
            country: address.country || "India",
            postalCode: address.postalCode || "",
            landmark: address.landmark || "",
        });
        setShowAddressForm(true);
    };

    const handleAddressSubmit = async (e) => {
        e.preventDefault();

        // Validate required fields
        const requiredFields = [
            "recipientName",
            "phone",
            "line1",
            "city",
            "state",
            "postalCode",
        ];
        const missingFields = requiredFields.filter((field) => !addressForm[field]);

        if (missingFields.length > 0) {
            showNotification({
                message: `Please fill in all required fields: ${missingFields.join(", ")}`,
                type: "error",
            });
            return;
        }

        // Validate phone number format
        if (!/^\+?[\d\s\-\(\)]{10,15}$/.test(addressForm.phone)) {
            showNotification({
                message: "Please enter a valid phone number",
                type: "error",
            });
            return;
        }

        // Validate postal code (6 digits for India)
        if (!/^\d{6}$/.test(addressForm.postalCode)) {
            showNotification({
                message: "Please enter a valid 6-digit postal code",
                type: "error",
            });
            return;
        }

        try {
            if (editingAddress) {
                await updateAddress(editingAddress.id, addressForm);
                showNotification({
                    message: "Address updated successfully",
                    type: "success",
                });
            } else {
                const newAddress = await addAddress(addressForm);

                if (!newAddress) {
                    setModalOpen(true);
                    showNotification({
                        message: "Please login to add an address",
                        type: "info",
                    });
                    return;
                }

                showNotification({
                    message: "Address added successfully",
                    type: "success",
                });
            }
            handleCancelForm();
        } catch (error) {
            showNotification({
                message: error.message || "Failed to save address. Please try again.",
                type: "error",
            });
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Manage Addresses</h2>
                {!showAddressForm && (
                    <button
                        onClick={() => setShowAddressForm(true)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                        + Add New Address
                    </button>
                )}
            </div>

            {/* Address Form */}
            {showAddressForm && (
                <div className="mb-6 p-6 bg-gray-50 rounded-lg border">
                    <h3 className="font-semibold text-gray-800 mb-4">
                        {editingAddress ? "Edit Address" : "Add New Address"}
                    </h3>

                    <form onSubmit={handleAddressSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Address Label *
                                </label>
                                <select
                                    value={addressForm.label}
                                    onChange={(e) => handleFormChange("label", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    <option value="Home">Home</option>
                                    <option value="Work">Work</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Recipient Name *
                                </label>
                                <input
                                    type="text"
                                    value={addressForm.recipientName}
                                    onChange={(e) =>
                                        handleFormChange("recipientName", e.target.value)
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Full name"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number *
                            </label>
                            <input
                                type="tel"
                                value={addressForm.phone}
                                onChange={(e) => handleFormChange("phone", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="10-digit phone number"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Address Line 1 *
                            </label>
                            <input
                                type="text"
                                value={addressForm.line1}
                                onChange={(e) => handleFormChange("line1", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="House/Flat/Building details"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Address Line 2
                            </label>
                            <input
                                type="text"
                                value={addressForm.line2}
                                onChange={(e) => handleFormChange("line2", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Area/Locality details"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Landmark
                            </label>
                            <input
                                type="text"
                                value={addressForm.landmark}
                                onChange={(e) => handleFormChange("landmark", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Nearby landmark (optional)"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    City *
                                </label>
                                <input
                                    type="text"
                                    value={addressForm.city}
                                    onChange={(e) => handleFormChange("city", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="City"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    State *
                                </label>
                                <input
                                    type="text"
                                    value={addressForm.state}
                                    onChange={(e) => handleFormChange("state", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="State"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Postal Code *
                                </label>
                                <input
                                    type="text"
                                    value={addressForm.postalCode}
                                    onChange={(e) => handleFormChange("postalCode", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="6-digit PIN"
                                    pattern="\d{6}"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <button
                                type="button"
                                onClick={handleUseCurrentLocation}
                                disabled={geoLoading}
                                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                            >
                                {geoLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span>Getting Location...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>📍</span>
                                        <span>Use Current Location</span>
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="flex space-x-4">
                            <button
                                type="submit"
                                disabled={addressLoading}
                                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                            >
                                {addressLoading
                                    ? "Saving..."
                                    : editingAddress
                                        ? "Update Address"
                                        : "Add Address"}
                            </button>

                            <button
                                type="button"
                                onClick={handleCancelForm}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Existing Addresses */}
            {addresses.length > 0 ? (
                <div className="space-y-4">
                    {addresses.map((address) => (
                        <div
                            key={address.id}
                            className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-all"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <span
                                            className={`px-2 py-1 rounded text-xs font-medium ${address.label === "Home"
                                                    ? "bg-green-100 text-green-800"
                                                    : address.label === "Work"
                                                        ? "bg-blue-100 text-blue-800"
                                                        : "bg-gray-100 text-gray-800"
                                                }`}
                                        >
                                            {address.label}
                                        </span>

                                        {address.isDefault && (
                                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                                                Default
                                            </span>
                                        )}
                                    </div>

                                    <div className="text-gray-800 font-medium mb-1">
                                        {address.recipientName}
                                    </div>

                                    <div className="text-gray-600 text-sm">
                                        {address.line1}
                                        {address.line2 && `, ${address.line2}`}
                                        {address.landmark && ` (Near ${address.landmark})`}
                                        <br />
                                        {address.city}, {address.state} - {address.postalCode}
                                        <br />
                                        📞 {address.phone}
                                    </div>
                                </div>

                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleEditAddress(address)}
                                        className="text-blue-600 hover:text-blue-700 p-1 transition-colors"
                                    >
                                        ✏️
                                    </button>

                                    <button
                                        onClick={() => {
                                            if (
                                                window.confirm(
                                                    "Are you sure you want to delete this address?"
                                                )
                                            ) {
                                                deleteAddress(address.id);
                                            }
                                        }}
                                        className="text-red-600 hover:text-red-700 p-1 transition-colors"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                !showAddressForm && (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
                            <svg fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-800 mb-2">
                            No addresses found
                            -</h3>
                        <p className="text-gray-600 mb-4">
                            Add your first delivery address
                        </p>
                        <button
                            onClick={() => setShowAddressForm(true)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                        >
                            Add Address
                        </button>
                    </div>
                )
            )}
        </div>
    );
};

export default AddressManager;

import React, { useState, useEffect } from "react";
import useAddressStore from "../../store/addressStore";
import useAuthStore from "../../store/authStore";
import useNotificationStore from "../../store/notificationStore";
import MobileMapAddressPicker from "../Address/MobileMapAddressPicker";
import AddressList from "../Address/AddressList";
import AddressForm from "../Address/AddressForm";

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
    const [showMobileMapPicker, setShowMobileMapPicker] = useState(false);
    const [isMobileApp, setIsMobileApp] = useState(false);



    useEffect(() => {
        fetchAddresses();
    }, [fetchAddresses]);

    // Detect mobile app environment or mobile screen size
    useEffect(() => {
        const checkMobile = () => {
            const isApp = localStorage.getItem("isMobileApp") === "true" ||
                window.location.search.includes("mode=webview");
            const isMobileScreen = window.innerWidth < 768;
            setIsMobileApp(isApp || isMobileScreen);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);



    const handleCancelForm = () => {
        setShowAddressForm(false);
        setEditingAddress(null);
    };

    const handleEditAddress = (address) => {
        setEditingAddress(address);
        setShowAddressForm(true);
    };



    return (
        <div className={`bg-white rounded-lg shadow-sm ${isMobileApp ? "p-0 min-h-screen" : "p-8"}`}>
            {/* Mobile Map Address Picker */}
            {showMobileMapPicker && (
                <MobileMapAddressPicker
                    onClose={() => setShowMobileMapPicker(false)}
                    onAddressSelect={() => {
                        setShowMobileMapPicker(false);
                        fetchAddresses(); // Refresh address list
                    }}
                />
            )}

            {/* Header Section */}
            <div className={`flex items-center justify-between ${isMobileApp ? "p-4 border-b bg-white sticky top-0 z-10" : "mb-6"}`}>
                <div className="flex items-center">
                    {isMobileApp && (
                        <button onClick={() => window.history.back()} className="mr-3">
                            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                    )}
                    <h2 className={`${isMobileApp ? "text-lg" : "text-2xl"} font-bold text-gray-900`}>
                        {isMobileApp ? "Saved Addresses" : "Manage Addresses"}
                    </h2>
                </div>

                {isMobileApp && !showAddressForm && (
                    <button
                        onClick={() => {
                            if (useAuthStore.getState().user) {
                                setShowMobileMapPicker(true);
                            } else {
                                setModalOpen(true);
                            }
                        }}
                        className="text-blue-600 font-medium text-sm flex items-center"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add New
                    </button>
                )}
            </div>

            {/* Desktop Add Address Bar */}
            {!isMobileApp && !showAddressForm && (
                <div
                    onClick={() => {
                            if (useAuthStore.getState().user) {
                                setShowAddressForm(true);
                            } else {
                                setModalOpen(true);
                            }
                        }}
                    className="mb-6 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors flex items-center text-blue-600 font-semibold uppercase tracking-wide"
                >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    ADD A NEW ADDRESS
                </div>
            )}

            {/* Address Form */}
            {showAddressForm && (
                <div className={`${isMobileApp ? "p-4" : "mb-6"}`}>
                    <AddressForm
                        existingAddress={editingAddress}
                        onCancel={handleCancelForm}
                        onSuccess={() => {
                            fetchAddresses();
                            handleCancelForm();
                            showNotification({
                                message: editingAddress ? "Address updated successfully" : "Address added successfully",
                                type: "success"
                            });
                        }}
                    />
                </div>
            )}

            {/* Existing Addresses */}
            {addresses.length > 0 ? (
                <AddressList
                    addresses={addresses}
                    isMobile={isMobileApp}
                    onEdit={handleEditAddress}
                    onDelete={(address) => {
                        if (
                            window.confirm(
                                "Are you sure you want to delete this address?"
                            )
                        ) {
                            deleteAddress(address.id);
                        }
                    }}
                />
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
                        </h3>
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

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAddressStore from "../../store/addressStore";
import useAuthStore from "../../store/authStore";
import useNotificationStore from "../../store/notificationStore";
import MobileMapAddressPicker from "../Address/MobileMapAddressPicker";
import AddressList from "../Address/AddressList";
import AddressForm from "../Address/AddressForm";
import { handleBackNavigation, isWebViewMode } from "../../utils/navigation";

const AddressManager = () => {
    const navigate = useNavigate();
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
                        <button onClick={() => {
                            if (isWebViewMode()) {
                                navigate("/profile-tab");
                            } else {
                                window.history.back();
                            }
                        }} className="mr-3">
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
                                if (isWebViewMode()) {
                                    setShowAddressForm(true);
                                } else {
                                    setShowMobileMapPicker(true);
                                }
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
                    <div className="flex-1 flex flex-col items-center justify-center py-24 px-4 bg-white rounded-xl h-full md:mx-0">
                        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
                            <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                            Where should we deliver?
                        </h3>
                        <p className="text-gray-500 mb-8 text-center max-w-sm">
                            You have no saved addresses. Add a delivery address to ensure accurate shipping and delivery estimates for your orders.
                        </p>
                        <button
                            onClick={() => {
                                if (useAuthStore.getState().user) {
                                    if (isMobileApp) {
                                        if (isWebViewMode()) {
                                            setShowAddressForm(true);
                                        } else {
                                            setShowMobileMapPicker(true);
                                        }
                                    } else {
                                        setShowAddressForm(true);
                                    }
                                } else {
                                    setModalOpen(true);
                                }
                            }}
                            className="group relative inline-flex items-center justify-center px-8 py-3.5 text-base font-bold text-white transition-all duration-200 bg-blue-600 border border-transparent rounded-full shadow-md hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
                        >
                            <svg className="w-5 h-5 mr-2 -ml-1 text-white transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                            </svg>
                            Add New Address
                        </button>
                    </div>
                )
            )}
        </div>
    );
};

export default AddressManager;

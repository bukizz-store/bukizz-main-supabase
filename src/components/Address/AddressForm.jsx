import React, { useState, useEffect } from 'react';
import useAddressStore from "../../store/addressStore";

const AddressForm = ({ existingAddress, onCancel, onSuccess }) => {
    const {
        addAddress,
        updateAddress,
        loading: addressLoading,
        geoLoading,
        getCurrentLocationAndAddress,
    } = useAddressStore();

    const [formData, setFormData] = useState({
        recipientName: "",
        phone: "",
        postalCode: "",
        line2: "", // Locality
        line1: "", // Address (Area and Street)
        city: "",
        state: "",
        landmark: "",
        alternatePhone: "",
        label: "Home",
        country: "India",
        isDefault: false,
        lat: null,
        lng: null
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (existingAddress) {
            setFormData({
                recipientName: existingAddress.recipientName || "",
                phone: existingAddress.phone || "",
                postalCode: existingAddress.postalCode || "",
                line2: existingAddress.line2 || "",
                line1: existingAddress.line1 || "",
                city: existingAddress.city || "",
                state: existingAddress.state || "",
                landmark: existingAddress.landmark || "",
                alternatePhone: existingAddress.alternatePhone || "",
                label: existingAddress.label || "Home",
                country: existingAddress.country || "India",
                isDefault: existingAddress.isDefault || false,
                lat: existingAddress.lat || null,
                lng: existingAddress.lng || null
            });
        }
    }, [existingAddress]);

    const validateForm = () => {
        const newErrors = {};

        // Recipient Name
        if (!formData.recipientName?.trim()) {
            newErrors.recipientName = "Name is required";
        } else if (formData.recipientName.trim().length < 2) {
            newErrors.recipientName = "Name is too short";
        }

        // Phone Validation (Strict 10 digits)
        const phoneDigits = formData.phone?.replace(/\D/g, '') || "";
        if (!formData.phone?.trim()) {
            newErrors.phone = "Phone number is required";
        } else if (!/^[6-9]\d{9}$/.test(phoneDigits)) { // India specific mobile validation
            newErrors.phone = "Enter valid 10-digit mobile number";
        }

        // Pincode Validation (Strict 6 digits)
        const pincodeDigits = formData.postalCode?.replace(/\D/g, '') || "";
        if (!formData.postalCode?.trim()) {
            newErrors.postalCode = "Pincode is required";
        } else if (!/^\d{6}$/.test(pincodeDigits)) {
            newErrors.postalCode = "Pincode must be 6 digits";
        }

        // Address Line 1
        if (!formData.line1?.trim()) {
            newErrors.line1 = "Address is required";
        } else if (formData.line1.trim().length < 5) {
            newErrors.line1 = "Address is too short";
        }

        // Locality (Line 2)
        if (!formData.line2?.trim()) {
            newErrors.line2 = "Locality is required";
        }

        // City & State
        if (!formData.city?.trim()) newErrors.city = "City is required";
        if (!formData.state?.trim()) newErrors.state = "State is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: false }));
        }
    };

    const handleUseCurrentLocation = async () => {
        try {
            const { address, location } = await getCurrentLocationAndAddress();
            if (address) {
                setFormData(prev => ({
                    ...prev,
                    line1: address.line1 || "",
                    line2: address.line2 || "",
                    city: address.city || "",
                    state: address.state || "",
                    postalCode: address.postalCode || "",
                    landmark: address.landmark || "",
                    country: address.country || "India",
                    lat: location?.lat || null,
                    lng: location?.lng || null
                }));
                // Clear errors as fields are populated
                setErrors({});
            }
        } catch (error) {
            console.error("Failed to get location", error);
            alert("Failed to get current location. Please enter details manually.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            // alert("Please correct the highlighted fields.");
            return;
        }

        try {
            if (existingAddress) {
                await updateAddress(existingAddress.id, formData);
            } else {
                await addAddress(formData);
            }
            if (onSuccess) onSuccess();
        } catch (error) {
            alert(error.message || "Failed to save address");
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            {/* <h2 className="text-blue-600 font-bold uppercase mb-6 text-sm tracking-wide">
                {existingAddress ? "EDIT ADDRESS" : "ADD A NEW ADDRESS"}
            </h2> */}

            <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={geoLoading}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded mb-6 flex items-center justify-center space-x-2 text-sm transition-colors"
            >
                {geoLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                )}
                <span>Use my current location</span>
            </button>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <input
                            type="text"
                            name="recipientName"
                            value={formData.recipientName}
                            onChange={handleChange}
                            placeholder="Name"
                            className={`w-full px-4 py-3 border ${errors.recipientName ? 'border-red-500' : 'border-gray-300'} rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-gray-500`}

                        />
                        {errors.recipientName && <span className="text-xs text-red-500 absolute -bottom-4 left-0">{errors.recipientName}</span>}
                    </div>
                    <div className="relative">
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="10-digit mobile number"
                            className={`w-full px-4 py-3 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-gray-500`}

                        />
                        {errors.phone && <span className="text-xs text-red-500 absolute -bottom-4 left-0">{errors.phone}</span>}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <input
                            type="text"
                            name="postalCode"
                            value={formData.postalCode}
                            onChange={handleChange}
                            placeholder="Pincode"
                            className={`w-full px-4 py-3 border ${errors.postalCode ? 'border-red-500' : 'border-gray-300'} rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-gray-500`}

                        />
                        {errors.postalCode && <span className="text-xs text-red-500 absolute -bottom-4 left-0">{errors.postalCode}</span>}
                    </div>
                    <div className="relative">
                        <input
                            type="text"
                            name="line2"
                            value={formData.line2}
                            onChange={handleChange}
                            placeholder="Locality"
                            className={`w-full px-4 py-3 border ${errors.line2 ? 'border-red-500' : 'border-gray-300'} rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-gray-500`}
                        />
                        {errors.line2 && <span className="text-xs text-red-500 absolute -bottom-4 left-0">{errors.line2}</span>}
                    </div>
                </div>

                <div className="relative">
                    <textarea
                        name="line1"
                        value={formData.line1}
                        onChange={handleChange}
                        placeholder="Address (Area and Street)"
                        rows="3"
                        className={`w-full px-4 py-3 border ${errors.line1 ? 'border-red-500' : 'border-gray-300'} rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-gray-500 resize-none`}

                    />
                    {errors.line1 && <span className="text-xs text-red-500 absolute -bottom-4 left-0">{errors.line1}</span>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            placeholder="City/District/Town"
                            className={`w-full px-4 py-3 border ${errors.city ? 'border-red-500' : 'border-gray-300'} rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-gray-500`}

                        />
                        {errors.city && <span className="text-xs text-red-500 absolute -bottom-4 left-0">{errors.city}</span>}
                    </div>
                    <div className="relative">
                        <select
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 border ${errors.state ? 'border-red-500' : 'border-gray-300'} rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${formData.state ? 'text-gray-900' : 'text-gray-500'}`}

                        >
                            <option value="" disabled>--Select State--</option>
                            <option value="Andhra Pradesh">Andhra Pradesh</option>
                            <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                            <option value="Assam">Assam</option>
                            <option value="Bihar">Bihar</option>
                            <option value="Chhattisgarh">Chhattisgarh</option>
                            <option value="Goa">Goa</option>
                            <option value="Gujarat">Gujarat</option>
                            <option value="Haryana">Haryana</option>
                            <option value="Himachal Pradesh">Himachal Pradesh</option>
                            <option value="Jharkhand">Jharkhand</option>
                            <option value="Karnataka">Karnataka</option>
                            <option value="Kerala">Kerala</option>
                            <option value="Madhya Pradesh">Madhya Pradesh</option>
                            <option value="Maharashtra">Maharashtra</option>
                            <option value="Manipur">Manipur</option>
                            <option value="Meghalaya">Meghalaya</option>
                            <option value="Mizoram">Mizoram</option>
                            <option value="Nagaland">Nagaland</option>
                            <option value="Odisha">Odisha</option>
                            <option value="Punjab">Punjab</option>
                            <option value="Rajasthan">Rajasthan</option>
                            <option value="Sikkim">Sikkim</option>
                            <option value="Tamil Nadu">Tamil Nadu</option>
                            <option value="Telangana">Telangana</option>
                            <option value="Tripura">Tripura</option>
                            <option value="Uttar Pradesh">Uttar Pradesh</option>
                            <option value="Uttarakhand">Uttarakhand</option>
                            <option value="West Bengal">West Bengal</option>
                            <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                            <option value="Chandigarh">Chandigarh</option>
                            <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option>
                            <option value="Delhi">Delhi</option>
                            <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                            <option value="Ladakh">Ladakh</option>
                            <option value="Lakshadweep">Lakshadweep</option>
                            <option value="Puducherry">Puducherry</option>
                        </select>
                        {errors.state && <span className="text-xs text-red-500 absolute -bottom-4 left-0">{errors.state}</span>}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <input
                            type="text"
                            name="landmark"
                            value={formData.landmark}
                            onChange={handleChange}
                            placeholder="Landmark (Optional)"
                            className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-gray-500"
                        />
                    </div>
                    <div className="relative">
                        <input
                            type="tel"
                            name="alternatePhone"
                            value={formData.alternatePhone}
                            onChange={handleChange}
                            placeholder="Alternate Phone (Optional)"
                            className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-gray-500"
                        />
                    </div>
                </div>

                <div className="mt-4">
                    <label className="block text-gray-500 text-sm mb-2">Address Type</label>
                    <div className="flex items-center space-x-6">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="radio"
                                name="label"
                                value="Home"
                                checked={formData.label === "Home"}
                                onChange={handleChange}
                                className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-gray-700">Home</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="radio"
                                name="label"
                                value="Work"
                                checked={formData.label === "Work"}
                                onChange={handleChange}
                                className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-gray-700">Work</span>
                        </label>
                    </div>
                </div>

                <div className="mt-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="checkbox"
                            name="isDefault"
                            checked={formData.isDefault}
                            onChange={handleChange}
                            className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500 rounded"
                        />
                        <span className="text-gray-700 text-sm">Make this my default address</span>
                    </label>
                </div>

                <div className="flex items-center space-x-4 pt-4 mt-4">
                    <button
                        type="submit"
                        disabled={addressLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded shadow-sm text-sm uppercase tracking-wide transition-colors"
                    >
                        {addressLoading ? "Saving..." : "Save"}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="text-blue-600 font-bold py-3 px-4 text-sm uppercase tracking-wide hover:text-blue-700 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddressForm;

import React, { useState, useCallback, useRef, useEffect } from "react";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import useAddressStore from "../../store/addressStore";
import useNotificationStore from "../../store/notificationStore";
import useAuthStore from "../../store/authStore";
import "./MobileMapAddressPicker.css";

const libraries = ["places"];

const defaultCenter = {
    lat: 26.4499,
    lng: 80.3319, // Kanpur, India
};

const mapContainerStyle = {
    width: "100%",
    height: "100%",
};

const mapOptions = {
    disableDefaultUI: true,
    zoomControl: false,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: false,
    gestureHandling: "greedy",
    clickableIcons: false,
};

const MobileMapAddressPicker = ({ onClose, onAddressSelect, isEditing = false }) => {
    const [step, setStep] = useState("prompt"); // prompt, map, form
    const [mapCenter, setMapCenter] = useState(defaultCenter);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [isGeocodingLoading, setIsGeocodingLoading] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const [distance, setDistance] = useState(null);
    const [isLocating, setIsLocating] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        studentName: "",
        flatBuilding: "",
        recipientName: "",
        phone: "",
        alternatePhone: "",
        landmark: "",
        city: "",
        state: "",
        postalCode: "",
        label: "Home",
        line2: "",
        isDefault: false,
    });

    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState(null);

    // Populate form data when address is selected
    useEffect(() => {
        if (selectedAddress) {
            setFormData(prev => ({
                ...prev,
                flatBuilding: selectedAddress.houseNumber || selectedAddress.line1 || "",
                line2: selectedAddress.line2 || selectedAddress.locality || "",
                landmark: selectedAddress.landmark || "",
                city: selectedAddress.city || "",
                state: selectedAddress.state || "",
                postalCode: selectedAddress.postalCode || "",
            }));
        }
    }, [selectedAddress]);

    // Lock body scroll when component mounts
    useEffect(() => {
        // Save current overflow style
        const originalStyle = window.getComputedStyle(document.body).overflow;

        // Prevent scrolling on the body
        document.body.style.overflow = "hidden";

        // Restore scrolling on unmount
        return () => {
            document.body.style.overflow = originalStyle;
        };
    }, []);

    const mapRef = useRef(null);
    const searchInputRef = useRef(null);
    const autocompleteRef = useRef(null);
    const geocodeTimeoutRef = useRef(null);

    const { reverseGeocodeEnhanced, addAddress } = useAddressStore();
    const { showNotification } = useNotificationStore();

    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
        libraries,
    });

    // Handle getting current location
    const getCurrentLocation = useCallback(() => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error("Geolocation is not supported"));
                return;
            }

            setIsLocating(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    setUserLocation(location);
                    setIsLocating(false);
                    resolve(location);
                },
                (error) => {
                    setIsLocating(false);
                    console.error("Geolocation error:", error);
                    reject(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 20000,
                    maximumAge: 0,
                    frequency: 1000
                }
            );
        });
    }, []);

    // Debounced reverse geocode location to get address
    const reverseGeocode = useCallback((lat, lng) => {
        // Clear any pending geocode request
        if (geocodeTimeoutRef.current) {
            clearTimeout(geocodeTimeoutRef.current);
        }

        setIsGeocodingLoading(true);

        // Debounce the geocoding call
        geocodeTimeoutRef.current = setTimeout(async () => {
            try {
                const address = await reverseGeocodeEnhanced(lat, lng);
                setSelectedAddress({
                    ...address,
                    lat,
                    lng,
                });

                // Calculate distance if user location is available
                if (userLocation) {
                    const dist = calculateDistance(userLocation.lat, userLocation.lng, lat, lng);
                    setDistance(dist);
                }
            } catch (error) {
                console.error("Reverse geocoding error:", error);
                // Set a fallback address
                setSelectedAddress({
                    lat,
                    lng,
                    line1: "",
                    line2: "",
                    city: "Unknown",
                    state: "",
                    postalCode: "",
                });
            } finally {
                setIsGeocodingLoading(false);
            }
        }, 300); // 300ms debounce
    }, [reverseGeocodeEnhanced, userLocation]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (geocodeTimeoutRef.current) {
                clearTimeout(geocodeTimeoutRef.current);
            }
        };
    }, []);

    // Calculate distance between two coordinates
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Earth's radius in km
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return (R * c).toFixed(1);
    };

    // Handle location prompt options
    const handleLocationChoice = async (useCurrentLocation) => {
        if (useCurrentLocation) {
            try {
                const location = await getCurrentLocation();
                setMapCenter(location);
                setStep("map");
                // Pan map to location after it loads
                setTimeout(() => {
                    if (mapRef.current) {
                        mapRef.current.panTo(location);
                        mapRef.current.setZoom(17);
                    }
                }, 500);
            } catch (error) {
                if (error.code === 1) { // User denied Geolocation
                    showNotification({
                        message: "Location permission denied. Please enable it in your browser settings.",
                        type: "error",
                    });
                } else {
                    showNotification({
                        message: "Could not get location. Please allow location access or search manually.",
                        type: "error",
                    });
                }
                setStep("map");
            }
        } else {
            setStep("map");
        }
    };

    // Track last geocoded center to prevent infinite loops
    const lastCenterRef = useRef(defaultCenter);

    // Handle map idle (after drag or zoom ends)
    const handleMapIdle = useCallback(() => {
        if (mapRef.current) {
            const center = mapRef.current.getCenter();
            if (center) {
                const lat = center.lat();
                const lng = center.lng();

                // Check if significantly changed from LAST PROCESSED center (epsilon check)
                // 0.000001 degrees is ~11cm, sufficient for "address hasn't changed"
                const last = lastCenterRef.current;
                const isSame =
                    Math.abs(lat - last.lat) < 0.000001 &&
                    Math.abs(lng - last.lng) < 0.000001;

                if (!isSame) {
                    lastCenterRef.current = { lat, lng };
                    setMapCenter({ lat, lng });
                    reverseGeocode(lat, lng);
                }
            }
        }
    }, [reverseGeocode]);

    // Handle use current location from map view
    const handleUseCurrentLocation = async () => {
        try {
            const location = await getCurrentLocation();
            setMapCenter(location);
            if (mapRef.current) {
                mapRef.current.panTo(location);
                mapRef.current.setZoom(17);
            }
        } catch (error) {
            if (error.code === 1) { // User denied Geolocation
                showNotification({
                    message: "Location permission denied. Please enable it in your browser settings.",
                    type: "error",
                });
            } else {
                showNotification({
                    message: "Could not get current location. Please enable location access.",
                    type: "error",
                });
            }
        }
    };

    // Callback ref for search input to initialize Autocomplete when DOM node is ready
    const searchInputCallbackRef = useCallback((node) => {
        if (node && isLoaded && !autocompleteRef.current && window.google && window.google.maps && window.google.maps.places) {
            try {
                autocompleteRef.current = new window.google.maps.places.Autocomplete(
                    node,
                    {
                        componentRestrictions: { country: "in" },
                        fields: ["geometry", "formatted_address", "address_components", "name"],
                    }
                );

                autocompleteRef.current.addListener("place_changed", () => {
                    const place = autocompleteRef.current.getPlace();
                    if (place.geometry && place.geometry.location) {
                        const lat = place.geometry.location.lat();
                        const lng = place.geometry.location.lng();

                        // Parse address components
                        const addressComponents = place.address_components || [];
                        let line1 = "";
                        let line2 = "";
                        let city = "";
                        let state = "";
                        let postalCode = "";
                        let country = "";
                        let houseNumber = "";
                        let route = "";
                        let sublocality = "";
                        let sublocality2 = "";
                        let sublocality3 = "";

                        addressComponents.forEach(component => {
                            const types = component.types;
                            if (types.includes("street_number")) {
                                houseNumber = component.long_name;
                            }
                            if (types.includes("route")) {
                                route = component.long_name;
                            }
                            if (types.includes("sublocality_level_2")) {
                                sublocality2 = component.long_name;
                            }
                            if (types.includes("sublocality_level_3")) {
                                sublocality3 = component.long_name;
                            }
                            if (types.includes("sublocality") || types.includes("sublocality_level_1")) {
                                sublocality = component.long_name;
                            }
                            if (types.includes("locality")) {
                                city = component.long_name;
                            }
                            if (types.includes("administrative_area_level_1")) {
                                state = component.long_name;
                            }
                            if (types.includes("postal_code")) {
                                postalCode = component.long_name;
                            }
                            if (types.includes("country")) {
                                country = component.long_name;
                            }
                        });


                        line1 = [houseNumber, route].filter(Boolean).join(" ");
                        // Construct line2 better to include all locality details
                        line2 = [sublocality3, sublocality2, sublocality].filter(Boolean).join(", ");

                        // If line1 is empty, try to use name or formatted address part
                        if (!line1 && place.name) {
                            line1 = place.name;
                        }

                        const newAddress = {
                            line1,
                            line2,
                            city,
                            state,
                            postalCode,
                            country,
                            lat,
                            lng,
                            locality: sublocality || city // fallback for display
                        };

                        // Update state immediately
                        setSelectedAddress(newAddress);

                        // Update map center and lastCenterRef to PREVENT re-geocoding on idle
                        setMapCenter({ lat, lng });
                        lastCenterRef.current = { lat, lng };

                        if (mapRef.current) {
                            mapRef.current.panTo({ lat, lng });
                            mapRef.current.setZoom(17);
                        }
                        // Clear input after selection
                        node.value = "";
                    }
                });
            } catch (error) {
                console.error("Error initializing autocomplete:", error);
            }
        }
    }, [isLoaded, reverseGeocode]);

    // Handle form input changes
    const handleFormChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
        // Clear error when user types
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    // Handle form submission
    const handleSaveAddress = async () => {
        setSubmitError(null);
        // Validate required fields
        const newErrors = {};
        if (!formData.studentName.trim()) newErrors.studentName = "Student Name is required";
        if (!formData.flatBuilding.trim()) newErrors.flatBuilding = "Flat/House/Building is required";
        if (!formData.recipientName.trim()) newErrors.recipientName = "Full Name is required";

        if (!formData.phone.trim()) {
            newErrors.phone = "Phone number is required";
        } else if (!/^[0-9]{10}$/.test(formData.phone)) {
            newErrors.phone = "Invalid 10-digit phone number";
        }

        if (!formData.city.trim()) newErrors.city = "City is required";
        if (!formData.state.trim()) newErrors.state = "State is required";

        if (!formData.postalCode.trim()) {
            newErrors.postalCode = "Pincode is required";
        } else if (!/^\d{6}$/.test(formData.postalCode)) {
            newErrors.postalCode = "Invalid 6-digit pincode";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            showNotification({
                message: "Please fix the highlighted errors",
                type: "error",
            });
            return;
        }

        const addressData = {
            studentName: formData.studentName,
            label: formData.label,
            recipientName: formData.recipientName,
            phone: formData.phone,
            alternatePhone: formData.alternatePhone || null,
            line1: formData.flatBuilding,
            line2: formData.line2 || selectedAddress?.line2 || selectedAddress?.locality || "",
            city: formData.city,
            state: formData.state,
            country: "India",
            postalCode: formData.postalCode,
            landmark: formData.landmark,
            lat: mapCenter.lat,
            lng: mapCenter.lng,
            isDefault: formData.isDefault,
        };

        try {
            console.log("Saving address...", addressData);
            const newAddress = await addAddress(addressData);
            console.log("Address saved:", newAddress);

            if (newAddress) {
                showNotification({
                    message: "Address added successfully!",
                    type: "success",
                });
                if (onAddressSelect) {
                    onAddressSelect(newAddress);
                }
                onClose();
            } else {
                // AddressStore returns null if no token, prompt login
                const setModalOpen = useAuthStore.getState().setModalOpen;
                setModalOpen(true);
                showNotification({
                    message: "Please login to add an address",
                    type: "info",
                });
            }
        } catch (error) {
            console.error("Save address error:", error);
            setSubmitError(error.message || "Failed to save address. Please try again.");
            // Still show global notification as a fallback, but the prominent one is local
            showNotification({
                message: error.message || "Failed to save address",
                type: "error",
            });
        }
    };

    // Get formatted locality name
    const getLocalityName = () => {
        if (!selectedAddress) return "";
        return selectedAddress.locality || selectedAddress.line2 || selectedAddress.city || "";
    };

    // Get full address string
    const getFullAddressString = () => {
        if (!selectedAddress) return "";
        const parts = [
            selectedAddress.line1,
            selectedAddress.line2,
            selectedAddress.city,
            selectedAddress.state,
            selectedAddress.postalCode,
        ].filter(Boolean);
        return parts.join(", ");
    };

    // Loading state
    if (loadError) {
        return (
            <div className="map-picker-error">
                <p>Error loading maps. Please try again.</p>
                <button onClick={onClose}>Close</button>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="map-picker-loading">
                <div className="loading-spinner"></div>
                <p>Loading map...</p>
            </div>
        );
    }

    return (
        <div className="mobile-map-picker">
            {/* Header */}
            <div className="map-picker-header">
                <button className="back-button" onClick={onClose}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1>Add new address</h1>
            </div>

            {/* Step 1: Location Prompt */}
            {step === "prompt" && (
                <div className="location-prompt-overlay">
                    <div className="location-prompt-content">
                        <h2>Where do you want us to deliver the order?</h2>
                        <p>This will help with the right map location</p>

                        <button
                            className="prompt-btn primary"
                            onClick={() => handleLocationChoice(false)}
                        >
                            Away from my location
                        </button>

                        <button
                            className="prompt-btn secondary"
                            onClick={() => handleLocationChoice(true)}
                            disabled={isLocating}
                        >
                            {isLocating ? (
                                <>
                                    <div className="btn-spinner"></div>
                                    Getting location...
                                </>
                            ) : (
                                <>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                    Use current location
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Step 2: Map View */}
            {step === "map" && (
                <>
                    {/* Search Bar - Uncontrolled input for Google autocomplete */}
                    <div className="map-search-bar">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF">
                            <circle cx="11" cy="11" r="8" strokeWidth="2" />
                            <path d="M21 21l-4.35-4.35" strokeWidth="2" />
                        </svg>
                        <input
                            ref={searchInputCallbackRef}
                            type="text"
                            placeholder="Search by area, name, street..."
                            autoComplete="off"
                        />
                    </div>

                    {/* Map Container */}
                    <div className="map-container">
                        <GoogleMap
                            mapContainerStyle={mapContainerStyle}
                            center={mapCenter}
                            zoom={17}
                            options={mapOptions}
                            onLoad={(map) => {
                                mapRef.current = map;
                            }}
                            onIdle={handleMapIdle}
                        />

                        {/* Fixed center pin */}
                        <div className="center-pin">
                            <div className="pin-instruction">Place pin on the exact location</div>
                            <div className="pin-marker">
                                <svg width="40" height="50" viewBox="0 0 40 50" fill="none">
                                    <ellipse cx="20" cy="47" rx="8" ry="3" fill="rgba(0,0,0,0.2)" />
                                    <path d="M20 0C10 0 2 8 2 18C2 30 20 45 20 45C20 45 38 30 38 18C38 8 30 0 20 0Z" fill="#374151" />
                                    <circle cx="20" cy="18" r="6" fill="white" />
                                </svg>
                            </div>
                            {getLocalityName() && (
                                <div className="locality-badge">{getLocalityName()}</div>
                            )}
                        </div>

                        {/* Recentering FAB - Bottom Right */}
                        <button
                            className="recenter-fab"
                            onClick={handleUseCurrentLocation}
                            disabled={isLocating}
                            title="Use my current location"
                        >
                            {isLocating ? (
                                <div className="btn-spinner-blue"></div>
                            ) : (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                            )}
                        </button>
                    </div>

                    {/* Bottom Sheet - Address Preview */}
                    <div className="address-preview-sheet">
                        <div className="sheet-header">
                            <span className="sheet-title">Deliver To</span>
                        </div>

                        <div className="address-preview-card">
                            <div className="address-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#3B82F6" />
                                    <circle cx="12" cy="9" r="2.5" fill="white" />
                                </svg>
                            </div>

                            <div className="address-details">
                                <div className="address-locality">
                                    {isGeocodingLoading ? (
                                        <div className="loading-shimmer">Loading...</div>
                                    ) : (
                                        getLocalityName() || "Drag map to select location"
                                    )}
                                </div>
                                <div className="address-full">
                                    {isGeocodingLoading ? "" : getFullAddressString()}
                                </div>
                                {distance && (
                                    <div className="address-distance">
                                        <span className="distance-value">{distance} kms</span> away from your current location
                                    </div>
                                )}
                            </div>

                            <button className="change-btn" onClick={() => setStep("prompt")}>Change</button>
                        </div>

                        <button
                            className="add-details-btn"
                            onClick={() => setStep("form")}
                            disabled={!selectedAddress || isGeocodingLoading}
                        >
                            Add address Details
                        </button>
                    </div>
                </>
            )}

            {/* Step 3: Address Details Form */}
            {step === "form" && (
                <div className="address-form-overlay">
                    <div className="address-form-sheet">
                        <div className="form-header">
                            <h2>Deliver To</h2>
                            <button className="close-form-btn" onClick={() => setStep("map")}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="form-info-tip">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 16v-4M12 8h.01" />
                            </svg>
                            <span>Ensure your address details are accurate for a smooth delivery experience</span>
                        </div>

                        {submitError && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3 mx-5 mt-4 text-sm shadow-sm">
                                <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <span className="font-semibold">{submitError}</span>
                            </div>
                        )}

                        <div className="form-content">
                            <div className="form-group">
                                <label>Student Name *</label>
                                <input
                                    type="text"
                                    value={formData.studentName}
                                    onChange={(e) => handleFormChange("studentName", e.target.value)}
                                    placeholder="Student Name *"
                                    style={errors.studentName ? { borderColor: '#ef4444' } : {}}
                                />
                                {errors.studentName && <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', display: 'block' }}>{errors.studentName}</span>}
                            </div>

                            <div className="form-group">
                                <label>Flat/House/building name *</label>
                                <input
                                    type="text"
                                    value={formData.flatBuilding}
                                    onChange={(e) => handleFormChange("flatBuilding", e.target.value)}
                                    placeholder="Flat/House/building name *"
                                    style={errors.flatBuilding ? { borderColor: '#ef4444' } : {}}
                                />
                                {errors.flatBuilding && <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', display: 'block' }}>{errors.flatBuilding}</span>}
                            </div>

                            <div className="form-group area-group">
                                <label>Area / Sector / Locality</label>
                                <div className="area-display">
                                    <input
                                        type="text"
                                        value={formData.line2}
                                        onChange={(e) => handleFormChange("line2", e.target.value)}
                                        placeholder="Area / Sector / Locality"
                                        className="w-full border-none p-0 focus:ring-0"
                                    />
                                    <button className="change-area-btn" onClick={() => setStep("map")}>Change</button>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Enter your full name *</label>
                                <input
                                    type="text"
                                    value={formData.recipientName}
                                    onChange={(e) => handleFormChange("recipientName", e.target.value)}
                                    placeholder="Enter your full name *"
                                    style={errors.recipientName ? { borderColor: '#ef4444' } : {}}
                                />
                                {errors.recipientName && <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', display: 'block' }}>{errors.recipientName}</span>}
                            </div>

                            <div className="form-group">
                                <label>10-digit mobile number *</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => handleFormChange("phone", e.target.value)}
                                    placeholder="10-digit mobile number *"
                                    maxLength={10}
                                    style={errors.phone ? { borderColor: '#ef4444' } : {}}
                                />
                                {errors.phone && <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', display: 'block' }}>{errors.phone}</span>}
                            </div>

                            <div className="form-group">
                                <label>Alternate phone number (Optional)</label>
                                <input
                                    type="tel"
                                    value={formData.alternatePhone}
                                    onChange={(e) => handleFormChange("alternatePhone", e.target.value)}
                                    placeholder="Alternate phone number (Optional)"
                                    maxLength={10}
                                />
                            </div>

                            <div className="form-group grid-cols-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label>Pincode *</label>
                                    <input
                                        type="text"
                                        value={formData.postalCode}
                                        onChange={(e) => handleFormChange("postalCode", e.target.value)}
                                        placeholder="Pincode *"
                                        style={errors.postalCode ? { borderColor: '#ef4444' } : {}}
                                    />
                                    {errors.postalCode && <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', display: 'block' }}>{errors.postalCode}</span>}
                                </div>
                                <div>
                                    <label>City *</label>
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => handleFormChange("city", e.target.value)}
                                        placeholder="City *"
                                        style={errors.city ? { borderColor: '#ef4444' } : {}}
                                    />
                                    {errors.city && <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', display: 'block' }}>{errors.city}</span>}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>State *</label>
                                <input
                                    type="text"
                                    value={formData.state}
                                    onChange={(e) => handleFormChange("state", e.target.value)}
                                    placeholder="State *"
                                    style={errors.state ? { borderColor: '#ef4444' } : {}}
                                />
                                {errors.state && <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', display: 'block' }}>{errors.state}</span>}
                            </div>

                            <div className="form-group">
                                <label>Landmark (Optional)</label>
                                <input
                                    type="text"
                                    value={formData.landmark}
                                    onChange={(e) => handleFormChange("landmark", e.target.value)}
                                    placeholder="Landmark (Optional, Near...)"
                                />
                            </div>

                            <div className="form-group">
                                <label>Type of address</label>
                                <div className="address-type-options">
                                    <button
                                        className={`type-btn ${formData.label === "Home" ? "active" : ""}`}
                                        onClick={() => handleFormChange("label", "Home")}
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                                        </svg>
                                        Home
                                    </button>
                                    <button
                                        className={`type-btn ${formData.label === "Work" ? "active" : ""}`}
                                        onClick={() => handleFormChange("label", "Work")}
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                                            <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
                                        </svg>
                                        Work
                                    </button>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.isDefault}
                                        onChange={(e) => handleFormChange("isDefault", e.target.checked)}
                                        className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500 rounded"
                                    />
                                    <span className="text-gray-700 px-4">Make this my default address</span>
                                </label>
                            </div>
                        </div>

                        <button className="save-address-btn mb-10" onClick={handleSaveAddress}>
                            Save address
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MobileMapAddressPicker;

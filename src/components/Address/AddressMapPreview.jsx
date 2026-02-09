import React from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

const containerStyle = {
    width: '100%',
    height: '100%'
};

const mapOptions = {
    disableDefaultUI: true,
    zoomControl: false,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: false,
    clickableIcons: false,
    draggable: false,
    scrollwheel: false,
    keyboardShortcuts: false,
};

const libraries = ["places"];

const AddressMapPreview = ({ lat, lng }) => {
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
        libraries,
    });

    const center = {
        lat: parseFloat(lat),
        lng: parseFloat(lng)
    };

    if (!isLoaded) {
        return (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <div className="animate-pulse text-xs text-gray-500">Loading map...</div>
            </div>
        );
    }

    if (!lat || !lng) {
        return (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <div className="text-xs text-gray-400">No location data</div>
            </div>
        );
    }

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={17}
            options={mapOptions}
        >
            <Marker position={center} />
        </GoogleMap>
    );
};

export default React.memo(AddressMapPreview);

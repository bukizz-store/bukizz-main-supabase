import React from 'react';
import AddressCard from './AddressCard';

const AddressList = ({
    addresses,
    selectedAddressId,
    onSelect,
    onEdit,
    onDelete,
    isMobile,
    onDeliverHere,
    onAddAddress // Optional: To show "Add Address" empty state if needed, or handled by parent
}) => {

    if (!addresses || addresses.length === 0) {
        return null; // Parent handles empty state usually, but can be added here
    }

    return (
        <div className={`space-y-4 ${isMobile ? "space-y-0 border-t border-gray-100" : ""}`}>
            {addresses.map((address) => (
                <AddressCard
                    key={address.id}
                    address={address}
                    isSelected={selectedAddressId === address.id}
                    onSelect={onSelect}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    isMobile={isMobile}
                    onDeliverHere={onDeliverHere}
                />
            ))}
        </div>
    );
};

export default AddressList;

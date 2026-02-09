import React, { useState } from 'react';

const AddressCard = ({
    address,
    isSelected,
    onSelect,
    onEdit,
    onDelete,
    isMobile,
    onDeliverHere // Optional: for checkout flow to show "Deliver Here" button
}) => {
    const [showMenu, setShowMenu] = useState(false);

    // Desktop Layout
    if (!isMobile) {
        return (
            <div
                className={`p-4 border rounded-lg transition-all relative ${isSelected ? "border-2 border-[#3B82F6] bg-blue-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                onClick={() => onSelect && onSelect(address)}
            >
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                            <span className="font-semibold text-gray-900">{address.recipientName}</span>
                            <span className="font-semibold text-gray-900">{address.phone}</span>
                            <span
                                className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${address.label === "Home"
                                    ? "bg-gray-200 text-gray-600"
                                    : "bg-gray-200 text-gray-600"
                                    }`}
                            >
                                {address.label}
                            </span>
                        </div>
                        <div className="text-gray-600 text-sm leading-relaxed pr-8">
                            {address.line1}
                            {address.line2 && `, ${address.line2}`}
                            {address.landmark && `, ${address.landmark}`}
                            <br />
                            <span className="font-medium text-gray-900">
                                {address.city}, {address.state} - {address.postalCode}
                            </span>
                        </div>
                    </div>

                    {/* Desktop Menu/Actions */}
                    <div className="relative group">
                        <button className="text-gray-400 p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                        </button>

                        <div className="absolute right-0 top-8 w-32 bg-white shadow-xl rounded-lg border border-gray-100 z-20 hidden group-hover:block">
                            <div className="py-1">
                                {onEdit && (
                                    <button
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors flex items-center space-x-2"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEdit(address);
                                        }}
                                    >
                                        <span>Edit</span>
                                    </button>
                                )}
                                {onDelete && (
                                    <button
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors flex items-center space-x-2"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete(address);
                                        }}
                                    >
                                        <span>Delete</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Older Design Edit/Delete was inline, but prompt requested specific look. 
                            The screenshot shows a floated right "Edit" button area. 
                            If it's managing addresses, usually just Edit/Delete.
                         */}
                </div>


            </div>
        );
    }

    // Mobile Layout (Flipkart Style)
    return (
        <div
            className={`bg-white p-4 rounded-lg border mb-3 transition-all ${isSelected ? "border-2 border-[#3B82F6] bg-blue-50" : "border-gray-200"}`}
            onClick={() => onSelect && onSelect(address)}
        >
            <div className="flex items-start">
                {/* Icon */}
                <div className="mr-3 text-gray-500 mt-1">
                    {address.label === "Work" ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                    )}
                </div>

                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-gray-900 text-sm mb-1">{address.recipientName}</h3>

                        {/* 3-Dot Menu */}
                        <div className="relative">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowMenu(!showMenu);
                                }}
                                className="text-gray-400 p-1"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                </svg>
                            </button>

                            {/* Popup Menu */}
                            {showMenu && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowMenu(false);
                                        }}
                                    ></div>
                                    <div className="absolute right-0 top-6 w-32 bg-white shadow-lg rounded border z-20 overflow-hidden">
                                        <button
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowMenu(false);
                                                onEdit(address);
                                            }}
                                        >
                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                            <span>Edit</span>
                                        </button>
                                        <button
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowMenu(false);
                                                onDelete(address);
                                            }}
                                        >
                                            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            <span>Delete</span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <p className="text-gray-600 text-xs mb-1 leading-relaxed">
                        {address.line1}
                        {address.line2 && `, ${address.line2}`}
                        {address.landmark && `, ${address.landmark}`}
                        , {address.city}, {address.postalCode}
                    </p>
                    <p className="text-gray-900 text-xs font-medium">
                        {address.phone}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AddressCard;

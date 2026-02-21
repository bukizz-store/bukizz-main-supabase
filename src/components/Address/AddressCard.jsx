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
                className={`relative flex items-start p-5 border rounded-xl cursor-pointer transition-all duration-200 ${isSelected
                    ? "border-blue-600 bg-blue-50/30 shadow-sm ring-1 ring-blue-600"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                onClick={() => onSelect && onSelect(address)}
            >
                <div className="flex items-center h-5 mt-1 mr-4">
                    <input
                        type="radio"
                        name="addressSelection"
                        checked={isSelected}
                        readOnly
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer pointer-events-none"
                    />
                </div>
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                            <span className="font-semibold text-gray-900">{address.recipientName}</span>
                            {address.studentName && (
                                <span className="font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded text-xs ml-2">
                                    Student: {address.studentName}
                                </span>
                            )}
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

    // Mobile Layout (Flipkart Style -> Professional Theme)
    return (
        <div
            className={`relative flex items-start p-4 border rounded-xl mb-3 cursor-pointer transition-all duration-200 ${isSelected
                ? "border-blue-600 bg-blue-50/30 shadow-sm ring-1 ring-blue-600"
                : "border-gray-200 bg-white"
                }`}
            onClick={() => onSelect && onSelect(address)}
        >
            <div className="flex items-center h-5 mt-1 mr-3">
                <input
                    type="radio"
                    name="addressSelectionMobile"
                    checked={isSelected}
                    readOnly
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer pointer-events-none"
                />
            </div>
            <div className="flex items-start flex-1">
                {/* Icon (Removed old icon logic to match new cleaner design) */}

                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <div className="flex flex-col mb-1">
                            <h3 className="font-semibold text-gray-900 text-sm">{address.recipientName}</h3>
                            {address.studentName && (
                                <span className="text-xs text-gray-500 mt-0.5">Student: {address.studentName}</span>
                            )}
                        </div>

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

import React from "react";

const BasicInfoTab = ({
  formData,
  setFormData,
  fieldErrors,
  showValidation,
  clearFieldError,
  getInputClassName,
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Basic Product Information
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Title *
          </label>
          <input
            type="text"
            required
            name="title"
            value={formData.title}
            onChange={(e) => {
              clearFieldError("title");
              setFormData({ ...formData, title: e.target.value });
            }}
            className={getInputClassName(
              "title",
              "w-full px-3 py-2 border rounded-md focus:outline-none"
            )}
            placeholder="e.g., Delhi Public School Class 11th Study Materials"
          />
          {showValidation && fieldErrors.title && (
            <p className="text-red-500 text-sm mt-1">{fieldErrors.title}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            SKU (Optional)
          </label>
          <input
            type="text"
            name="sku"
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., DPS-CLASS11-2025"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Type *
          </label>
          <select
            required
            name="productType"
            value={formData.productType}
            onChange={(e) =>
              setFormData({
                ...formData,
                productType: e.target.value,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="bookset">Bookset</option>
            <option value="uniform">Uniform</option>
            <option value="stationary">Stationary</option>
            <option value="general">General</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Base Price (₹) *
          </label>
          <input
            type="number"
            required
            name="basePrice"
            min="0"
            step="0.01"
            value={formData.basePrice}
            onChange={(e) => {
              clearFieldError("basePrice");
              setFormData({
                ...formData,
                basePrice: parseFloat(e.target.value) || 0,
              });
            }}
            className={getInputClassName(
              "basePrice",
              "w-full px-3 py-2 border rounded-md focus:outline-none"
            )}
            placeholder="800.00"
          />
          {showValidation && fieldErrors.basePrice && (
            <p className="text-red-500 text-sm mt-1">{fieldErrors.basePrice}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Currency
          </label>
          <select
            name="currency"
            value={formData.currency}
            onChange={(e) =>
              setFormData({ ...formData, currency: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="INR">INR (₹)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
          </select>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) =>
              setFormData({ ...formData, isActive: e.target.checked })
            }
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="isActive"
            className="ml-2 block text-sm text-gray-700"
          >
            Active Product
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Short Description *
        </label>
        <textarea
          rows={2}
          name="shortDescription"
          value={formData.shortDescription}
          onChange={(e) => {
            clearFieldError("shortDescription");
            setFormData({
              ...formData,
              shortDescription: e.target.value,
            });
          }}
          className={getInputClassName(
            "shortDescription",
            "w-full px-3 py-2 border rounded-md focus:outline-none"
          )}
          placeholder="Brief description for listings..."
        />
        {showValidation && fieldErrors.shortDescription && (
          <p className="text-red-500 text-sm mt-1">
            {fieldErrors.shortDescription}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Detailed Description
        </label>
        <textarea
          rows={6}
          name="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Comprehensive product description..."
        />
      </div>
    </div>
  );
};

export default BasicInfoTab;

import React from "react";

const VariantsTab = ({
  variants,
  productOptions,
  formData,
  showVariantGenerator,
  setShowVariantGenerator,
  generateVariants,
  updateVariant,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">
          Product Variants
        </h2>
        <button
          type="button"
          onClick={() => setShowVariantGenerator(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Generate Variants
        </button>
      </div>

      {showVariantGenerator && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 mb-3">
            This will generate all possible combinations based on your product
            options. Current options will create{" "}
            {productOptions
              .filter((opt) => opt.name && opt.values.some((v) => v.value))
              .reduce(
                (acc, opt) =>
                  acc * Math.max(1, opt.values.filter((v) => v.value).length),
                1
              )}{" "}
            variants.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={generateVariants}
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
            >
              Generate Now
            </button>
            <button
              type="button"
              onClick={() => setShowVariantGenerator(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {variants.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No variants created yet.</p>
          <p>Use "Generate Variants" button or set up product options first.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Combination
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price (₹)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Compare Price (₹)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Weight (kg)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {variants.map((variant, index) => (
                <tr key={index}>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={variant.sku}
                      onChange={(e) =>
                        updateVariant(index, "sku", e.target.value)
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {variant.optionCombination}
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={variant.price}
                      onChange={(e) =>
                        updateVariant(index, "price", e.target.value)
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={variant.compareAtPrice}
                      onChange={(e) =>
                        updateVariant(index, "compareAtPrice", e.target.value)
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="0"
                      value={variant.stock}
                      onChange={(e) =>
                        updateVariant(index, "stock", e.target.value)
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={variant.weight}
                      onChange={(e) =>
                        updateVariant(index, "weight", e.target.value)
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default VariantsTab;

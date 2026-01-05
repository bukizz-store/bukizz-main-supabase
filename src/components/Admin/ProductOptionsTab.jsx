import React, { useState, useEffect } from "react";
import useApiRoutesStore from "../../store/apiRoutesStore";

const ProductOptionsTab = ({
  productOptions,
  updateOption,
  updateOptionValue,
  addOptionValue,
  removeOptionValue,
  productId,
  onOptionsUpdated,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [existingOptions, setExistingOptions] = useState([]);

  // Fetch existing product options on component mount
  useEffect(() => {
    if (productId) {
      fetchExistingOptions();
    }
  }, [productId]);

  const fetchExistingOptions = async () => {
    try {
      const apiRoutes = useApiRoutesStore.getState();
      const response = await fetch(
        `${apiRoutes.baseUrl}/products/${productId}/options`,
        {
          headers: apiRoutes.getAuthHeaders(),
        }
      );

      if (response.ok) {
        const result = await response.json();
        setExistingOptions(result.data || []);
      }
    } catch (err) {
      console.error("Error fetching existing options:", err);
    }
  };

  const saveProductOptions = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const apiRoutes = useApiRoutesStore.getState();

      // Filter out empty options
      const validOptions = productOptions.filter(
        (opt) => opt.name.trim() && opt.values.some((v) => v.value.trim())
      );

      if (validOptions.length === 0) {
        setError("Please add at least one option with values before saving.");
        setLoading(false);
        return;
      }

      console.log("Saving valid options:", validOptions);
      const results = [];

      for (const option of validOptions) {
        // Clean up values - remove empty ones
        const validValues = option.values.filter((v) => v.value.trim());

        if (validValues.length === 0) continue;

        try {
          // Create or update the attribute
          const attributeData = {
            name: option.name.trim(),
            position: option.position,
            isRequired: option.isRequired,
          };

          console.log("Sending attribute data:", attributeData);

          let attributeResponse;
          const existingAttribute = existingOptions.find(
            (existing) => existing.name === option.name && existing.position === option.position
          );

          if (existingAttribute) {
            // Update existing attribute
            console.log("Updating existing attribute:", existingAttribute.id);
            attributeResponse = await fetch(
              `${apiRoutes.baseUrl}/products/options/${existingAttribute.id}`,
              {
                method: "PUT",
                headers: {
                  ...apiRoutes.getAuthHeaders(),
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(attributeData),
              }
            );
          } else {
            // Create new attribute
            console.log("Creating new attribute for product:", productId);
            attributeResponse = await fetch(
              `${apiRoutes.baseUrl}/products/${productId}/options`,
              {
                method: "POST",
                headers: {
                  ...apiRoutes.getAuthHeaders(),
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(attributeData),
              }
            );
          }

          const responseText = await attributeResponse.text();
          console.log("Attribute response:", responseText);

          if (!attributeResponse.ok) {
            throw new Error(`Failed to save attribute: ${responseText}`);
          }

          const attributeResult = JSON.parse(responseText);
          console.log("Parsed attribute result:", attributeResult);

          // Fix: Correct path to get the attribute ID from response
          const attributeId = attributeResult.data?.option?.id || attributeResult.data?.id;

          if (!attributeId) {
            console.error("No attribute ID found in response:", attributeResult);
            throw new Error("Failed to get attribute ID from server response");
          }

          console.log("Using attribute ID:", attributeId);

          // Now save the values for this attribute
          const valueResults = [];
          for (const value of validValues) {
            try {
              const valueData = {
                value: value.value.trim(),
                priceModifier: parseFloat(value.priceModifier) || 0,
                sortOrder: 0,
              };

              console.log("Sending value data:", valueData);

              const valueResponse = await fetch(
                `${apiRoutes.baseUrl}/products/options/${attributeId}/values`,
                {
                  method: "POST",
                  headers: {
                    ...apiRoutes.getAuthHeaders(),
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(valueData),
                }
              );

              const valueResponseText = await valueResponse.text();
              console.log("Value response:", valueResponseText);

              if (valueResponse.ok) {
                const valueResult = JSON.parse(valueResponseText);
                console.log("Parsed value result:", valueResult);
                valueResults.push(valueResult.data?.value || valueResult.data);
              } else {
                console.warn(`Failed to save value "${value.value}":`, valueResponseText);
              }
            } catch (valueError) {
              console.error(`Error saving value "${value.value}":`, valueError);
            }
          }

          results.push({
            attribute: attributeResult.data?.option || attributeResult.data,
            values: valueResults,
          });

        } catch (optionError) {
          console.error(`Error saving option "${option.name}":`, optionError);
          throw optionError;
        }
      }

      if (results.length > 0) {
        setSuccess(`Successfully saved ${results.length} product options with their values!`);

        // Refresh the existing options
        await fetchExistingOptions();

        // Notify parent component
        if (onOptionsUpdated) {
          onOptionsUpdated(results);
        }
      } else {
        setError("No options were saved. Please check your data and try again.");
      }

    } catch (err) {
      console.error("Error saving product options:", err);
      setError(`Failed to save options: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getOptionValueCount = (option) => {
    return option.values.filter((v) => v.value.trim()).length;
  };

  const getEstimatedVariantCount = () => {
    const validOptions = productOptions.filter(
      (opt) => opt.name.trim() && opt.values.some((v) => v.value.trim())
    );

    if (validOptions.length === 0) return 1;

    return validOptions.reduce((total, option) => {
      const valueCount = getOptionValueCount(option);
      return total * (valueCount || 1);
    }, 1);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Product Options</h2>
          <p className="text-sm text-gray-600 mt-1">
            Create up to 3 option groups (e.g., Size, Color, Type)
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">
            Estimated variants: <span className="font-semibold text-blue-600">{getEstimatedVariantCount()}</span>
          </p>
          <button
            type="button"
            onClick={saveProductOptions}
            disabled={loading}
            className={`mt-2 px-4 py-2 rounded-md text-sm font-medium ${loading
                ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
          >
            {loading ? "Saving..." : "Save Options"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {productOptions.map((option, optionIndex) => (
        <div key={optionIndex} className="bg-gray-50 p-6 rounded-lg border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-700">
              Option Group {optionIndex + 1}
            </h3>
            <div className="text-sm text-gray-600">
              Values: {getOptionValueCount(option)}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Option Name *
              </label>
              <input
                type="text"
                value={option.name}
                onChange={(e) =>
                  updateOption(optionIndex, "name", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Size, Color, Type"
              />
            </div>

            <div className="flex items-center mt-6">
              <input
                type="checkbox"
                id={`required-${optionIndex}`}
                checked={option.isRequired}
                onChange={(e) =>
                  updateOption(optionIndex, "isRequired", e.target.checked)
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor={`required-${optionIndex}`}
                className="ml-2 block text-sm text-gray-700"
              >
                Required Option
              </label>
            </div>

            <div className="flex items-center mt-6">
              <label className="block text-sm font-medium text-gray-700 mr-2">
                Position:
              </label>
              <span className="text-sm text-gray-600">{option.position}</span>
            </div>
          </div>

          {/* Option Values */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Option Values *
            </label>

            {option.values.map((value, valueIndex) => (
              <div key={valueIndex} className="flex gap-3 items-center">
                <input
                  type="text"
                  value={value.value}
                  onChange={(e) =>
                    updateOptionValue(
                      optionIndex,
                      valueIndex,
                      "value",
                      e.target.value
                    )
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Small, Medium, Large"
                />
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-600">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={value.priceModifier}
                    onChange={(e) =>
                      updateOptionValue(
                        optionIndex,
                        valueIndex,
                        "priceModifier",
                        e.target.value
                      )
                    }
                    className="w-24 px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    title="Price modifier (added to base price)"
                  />
                </div>
                {option.values.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeOptionValue(optionIndex, valueIndex)}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Remove this value"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={() => addOptionValue(optionIndex)}
              className="text-blue-500 hover:text-blue-700 text-sm font-medium"
            >
              + Add Value
            </button>
          </div>

          {option.name.trim() && option.values.some(v => v.value.trim()) && (
            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-700">
                <strong>{option.name}:</strong> {option.values.filter(v => v.value.trim()).map(v => v.value).join(", ")}
              </p>
            </div>
          )}
        </div>
      ))}

      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <h4 className="text-sm font-medium text-yellow-800 mb-2">💡 Tips for Product Options:</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Each option group can have multiple values (e.g., Size: Small, Medium, Large)</li>
          <li>• Price modifiers will be added to the base product price for each variant</li>
          <li>• Save options before generating variants to ensure proper linking</li>
          <li>• Required options must be selected by customers when ordering</li>
        </ul>
      </div>
    </div>
  );
};

export default ProductOptionsTab;

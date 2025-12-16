import React from "react";

const AssociationsTab = ({ formData, setFormData, schools, categories }) => {
  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold text-gray-800">
        Schools & Categories
      </h2>

      {/* School Associations */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-gray-700 mb-4">
          Associate with Schools
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grade/Class
            </label>
            <select
              value={formData.grade}
              onChange={(e) =>
                setFormData({ ...formData, grade: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Pre-KG">Pre-KG</option>
              <option value="LKG">LKG</option>
              <option value="UKG">UKG</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option
                  key={i}
                  value={`${i + 1}${
                    i === 0 ? "st" : i === 1 ? "nd" : i === 2 ? "rd" : "th"
                  }`}
                >
                  Class {i + 1}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center mt-6">
            <input
              type="checkbox"
              id="mandatory"
              checked={formData.mandatory}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  mandatory: e.target.checked,
                })
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="mandatory"
              className="ml-2 block text-sm text-gray-700"
            >
              Mandatory Product
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Schools
          </label>
          <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3 bg-white">
            {schools.map((school) => (
              <label key={school.id} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={formData.selectedSchools.includes(school.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData({
                        ...formData,
                        selectedSchools: [
                          ...formData.selectedSchools,
                          school.id,
                        ],
                      });
                    } else {
                      setFormData({
                        ...formData,
                        selectedSchools: formData.selectedSchools.filter(
                          (id) => id !== school.id
                        ),
                      });
                    }
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  {school.name} ({school.city}, {school.state})
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Category Associations */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-gray-700 mb-4">
          Associate with Categories
        </h3>

        <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3 bg-white">
          {categories.map((category) => (
            <label key={category.id} className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={formData.selectedCategories.includes(category.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData({
                      ...formData,
                      selectedCategories: [
                        ...formData.selectedCategories,
                        category.id,
                      ],
                    });
                  } else {
                    setFormData({
                      ...formData,
                      selectedCategories: formData.selectedCategories.filter(
                        (id) => id !== category.id
                      ),
                    });
                  }
                }}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                {category.name}
                {category.description && (
                  <span className="text-gray-500 text-xs block ml-6">
                    {category.description}
                  </span>
                )}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AssociationsTab;

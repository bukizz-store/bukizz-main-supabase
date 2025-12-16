/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      fontFamily: {
        abel: ["Abel", "sans-serif"],
        nunito: ["Nunito", "sans-serif"],
      },
      colors: {
        "gray-400": "var(--gray-400)",
        "gray-50": "var(--gray-50)",
        "gray-700": "var(--gray-700)",
        "gray-900": "var(--gray-900)",
        "primaryblue-700": "var(--primaryblue-700)",
        },
    },
  },
  plugins: [],
};

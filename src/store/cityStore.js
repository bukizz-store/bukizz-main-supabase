import { create } from "zustand";

/**
 * cityStore.js
 * Manages the globally selected city and synchronizes with localStorage.
 */
const useCityStore = create((set) => ({
  selectedCity: localStorage.getItem("selectedCity") || "kanpur",

  setSelectedCity: (city) => {
    localStorage.setItem("selectedCity", city);
    set({ selectedCity: city });
  },
}));

// Synchronize store when localStorage changes from other tabs or components
window.addEventListener("storage", (event) => {
  if (event.key === "selectedCity") {
    useCityStore.getState().setSelectedCity(event.newValue);
  }
});

export default useCityStore;

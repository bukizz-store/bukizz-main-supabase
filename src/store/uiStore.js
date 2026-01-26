import { create } from "zustand";

const useUIStore = create((set) => ({
    isCityPopupOpen: false,
    openCityPopup: () => set({ isCityPopupOpen: true }),
    closeCityPopup: () => set({ isCityPopupOpen: false }),
    toggleCityPopup: () => set((state) => ({ isCityPopupOpen: !state.isCityPopupOpen })),
}));

export default useUIStore;

import { create } from "zustand";

const useAppStore = create((set) => ({
  user: null,
  token: null,
  location: null,
  setAuth: ({ user, token }) => set({ user, token }),
  setLocation: (location) => set({ location }),
}));

export default useAppStore;

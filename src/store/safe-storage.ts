import type { StateStorage } from "zustand/middleware";

// Storage restrictions must never prevent navigating the house.
export const safeStorage: StateStorage = {
  getItem: (name) => {
    try {
      return window.localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      window.localStorage.setItem(name, value);
    } catch {
      window.dispatchEvent(new Event("heritage:storage-unavailable"));
    }
  },
  removeItem: (name) => {
    try {
      window.localStorage.removeItem(name);
    } catch {
      /* In-memory state still works. */
    }
  },
};

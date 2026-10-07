import { create } from "zustand";
import { persist } from "zustand/middleware";

// nama pengirim request diingat di HP, supaya tidak perlu diketik ulang
type ProfileState = {
  name: string;
  setName: (name: string) => void;
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      name: "",
      setName: (name) => set({ name }),
    }),
    { name: "exo-profile" },
  ),
);

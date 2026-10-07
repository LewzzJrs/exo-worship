import { create } from "zustand";
import { persist } from "zustand/middleware";

// disimpan di HP masing-masing (localStorage), hilang kalau data browser dihapus
type LibraryState = {
  savedSlugs: string[];
  toggleSaved: (slug: string) => void;
};

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set) => ({
      savedSlugs: [],
      // yang terbaru ditaruh paling depan
      toggleSaved: (slug) =>
        set((state) => ({
          savedSlugs: state.savedSlugs.includes(slug)
            ? state.savedSlugs.filter((item) => item !== slug)
            : [slug, ...state.savedSlugs],
        })),
    }),
    { name: "exo-library" },
  ),
);

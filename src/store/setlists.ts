import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Setlist, SetlistItem } from "@/types/setlist";

// setlist pribadi, disimpan di HP masing-masing
type SetlistState = {
  setlists: Setlist[];
  createSetlist: (name: string, date: string) => string;
  updateSetlist: (id: string, values: { name: string; date: string }) => void;
  deleteSetlist: (id: string) => void;
  addSong: (id: string, slug: string, key: string) => boolean;
  setItems: (id: string, items: SetlistItem[]) => void;
};

export const useSetlistStore = create<SetlistState>()(
  persist(
    (set, get) => {
      // ubah satu setlist saja, sisanya dibiarkan
      const updateOne = (id: string, change: (setlist: Setlist) => Setlist) =>
        set((state) => ({
          setlists: state.setlists.map((setlist) =>
            setlist.id === id ? change(setlist) : setlist,
          ),
        }));

      return {
        setlists: [],

        createSetlist: (name, date) => {
          const id = crypto.randomUUID();
          set((state) => ({
            setlists: [
              { id, name, date, items: [], createdAt: new Date().toISOString() },
              ...state.setlists,
            ],
          }));
          return id;
        },

        updateSetlist: (id, values) => updateOne(id, (setlist) => ({ ...setlist, ...values })),

        deleteSetlist: (id) =>
          set((state) => ({ setlists: state.setlists.filter((setlist) => setlist.id !== id) })),

        // false kalau lagu sudah ada di setlist
        addSong: (id, slug, key) => {
          const setlist = get().setlists.find((item) => item.id === id);
          if (!setlist || setlist.items.some((item) => item.slug === slug)) return false;
          updateOne(id, (current) => ({ ...current, items: [...current.items, { slug, key }] }));
          return true;
        },

        setItems: (id, items) => updateOne(id, (setlist) => ({ ...setlist, items })),
      };
    },
    { name: "exo-setlists" },
  ),
);

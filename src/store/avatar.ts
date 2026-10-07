import { create } from "zustand";

// dinaikkan setiap foto profil diganti, supaya semua avatar di halaman ikut memuat foto baru
type AvatarState = {
  version: number;
  bump: () => void;
};

export const useAvatarStore = create<AvatarState>()((set) => ({
  version: 0,
  bump: () => set({ version: Date.now() }),
}));

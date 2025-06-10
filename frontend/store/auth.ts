import { create } from 'zustand';

interface AuthState {
  isLoggedIn: boolean;
  user: { name: string; email: string } | null;
  login: (user: { name: string; email: string }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  isLoggedIn: false,
  user: null,
  login: (user) => set({ isLoggedIn: true, user }),
  logout: () => set({ isLoggedIn: false, user: null }),
})); 
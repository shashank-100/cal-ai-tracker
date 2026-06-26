import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  token: string | null;
  initialize: () => () => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  loading: true,
  token: null,

  initialize: () => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        set({
          session,
          user: session?.user ?? null,
          token: session?.access_token ?? null,
          loading: false,
        });
      }
    );

    // Fallback in case the initial onAuthStateChange event is delayed/missed,
    // so `loading` always resolves and the app never hangs on the splash.
    supabase.auth.getSession().then(({ data: { session } }) => {
      set((s) => s.loading ? {
        session,
        user: session?.user ?? null,
        token: session?.access_token ?? null,
        loading: false,
      } : s);
    });

    return () => subscription.unsubscribe();
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, token: null });
  },
}));

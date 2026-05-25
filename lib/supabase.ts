// Supabase is disabled — app runs fully offline with AsyncStorage.
// This stub prevents import errors in any files that still reference it.
export const supabase = {
  auth: {
    signInWithPassword: async () => ({ error: new Error('Offline mode') }),
    signUp: async () => ({ data: null, error: new Error('Offline mode') }),
    signOut: async () => {},
    getSession: async () => ({ data: { session: null } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
  from: (_table: string) => ({
    select: (_cols?: string) => ({
      eq: (_col: string, _val: unknown) => ({
        order: (_col: string, _opts?: unknown) => Promise.resolve({ data: [], error: null }),
        single: () => Promise.resolve({ data: null, error: null }),
      }),
      single: () => Promise.resolve({ data: null, error: null }),
    }),
    insert: (_data: unknown) => Promise.resolve({ error: null }),
    update: (_data: unknown) => ({
      eq: (_col: string, _val: unknown) => Promise.resolve({ error: null }),
    }),
    delete: () => ({
      eq: (_col: string, _val: unknown) => Promise.resolve({ error: null }),
    }),
  }),
};

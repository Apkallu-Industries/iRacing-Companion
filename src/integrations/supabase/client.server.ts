// Local Desktop Only: bypass Supabase completely

export const supabaseAdmin = new Proxy({} as any, {
  get(target, prop) {
    return () => {
      const chain = new Proxy({} as any, {
        get(t, p) {
          if (p === "then") {
            return (resolve: any) => resolve({ data: null, error: null });
          }
          return () => chain;
        },
      });
      return chain;
    };
  },
});

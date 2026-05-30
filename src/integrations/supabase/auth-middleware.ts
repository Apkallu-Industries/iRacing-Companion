import { createMiddleware } from "@tanstack/react-start";

export const requireSupabaseAuth = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    // Local Desktop Only: Bypass authentication and return a dummy Supabase client proxy.
    const dummySupabase = new Proxy({} as any, {
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

    return next({
      context: {
        supabase: dummySupabase,
        userId: "local-user-id",
        claims: { sub: "local-user-id", email: "local-developer@apex.trace" } as any,
      },
    });
  },
);

import { a as createMiddleware } from "./tanstack-Jo4b3tUQ.js";
const requireSupabaseAuth = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const dummySupabase = new Proxy({}, {
      get(target, prop) {
        return () => {
          const chain = new Proxy({}, {
            get(t, p) {
              if (p === "then") {
                return (resolve) => resolve({ data: null, error: null });
              }
              return () => chain;
            }
          });
          return chain;
        };
      }
    });
    return next({
      context: {
        supabase: dummySupabase,
        userId: "local-user-id",
        claims: { sub: "local-user-id", email: "local-developer@apex.trace" }
      }
    });
  }
);
export {
  requireSupabaseAuth as r
};

const supabaseAdmin = new Proxy(
  {},
  {
    get(target, prop) {
      return () => {
        const chain = new Proxy(
          {},
          {
            get(t, p) {
              if (p === "then") {
                return (resolve) => resolve({ data: null, error: null });
              }
              return () => chain;
            },
          },
        );
        return chain;
      };
    },
  },
);
export { supabaseAdmin as s };

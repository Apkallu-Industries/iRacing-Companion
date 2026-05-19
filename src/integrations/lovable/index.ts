import { supabase } from "../supabase/client";

type SignInOptions = {
  redirect_uri?: string;
  extraParams?: Record<string, string>;
};

export const lovable = {
  auth: {
    signInWithOAuth: async (provider: "google" | "apple" | "microsoft" | "lovable", opts?: SignInOptions) => {
      if (provider === "lovable") {
        return { error: new Error("Lovable provider login not supported outside of Lovable sandbox.") };
      }
      
      try {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: provider as any,
          options: {
            redirectTo: opts?.redirect_uri || `${window.location.origin}/sessions`,
          }
        });
        
        if (error) {
          return { error };
        }
        
        return { redirected: true, data };
      } catch (e) {
        return { error: e instanceof Error ? e : new Error(String(e)) };
      }
    },
  },
};

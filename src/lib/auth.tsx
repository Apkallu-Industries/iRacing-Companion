import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthCtx {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if there is a local mock session first
    const localSess =
      typeof window !== "undefined" ? localStorage.getItem("apex_local_session") : null;
    if (localSess) {
      try {
        setSession(JSON.parse(localSess));
        setLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem("apex_local_session");
      }
    }

    // Listener first per Supabase guidance
    const { data: sub } = supabase.auth.onAuthStateChange((_e: any, s: Session | null) => {
      if (s) {
        setSession(s);
      } else {
        const ls =
          typeof window !== "undefined" ? localStorage.getItem("apex_local_session") : null;
        if (ls) {
          try {
            setSession(JSON.parse(ls));
          } catch (_) {
            setSession(null);
          }
        } else {
          setSession(null);
        }
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data }: any) => {
      if (data.session) {
        setSession(data.session);
      }
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <Ctx.Provider
      value={{
        session,
        user: session?.user ?? null,
        loading,
        signOut: async () => {
          if (typeof window !== "undefined") {
            localStorage.removeItem("apex_local_session");
          }
          try {
            await supabase.auth.signOut();
          } catch (_) {}
          setSession(null);
        },
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type Role = "admin" | "user" | null;

interface AuthCtx {
  user: User | null;
  session: Session | null;
  role: Role;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx>({
  user: null,
  session: null,
  role: null,
  loading: true,
  signOut: async () => {},
  refreshRole: async () => {},
});

function resolveRole(roles: string[]): Role {
  if (roles.includes("admin")) return "admin";
  if (roles.includes("user")) return "user";
  return null;
}

async function loadRolesForUser(userId: string): Promise<Role> {
  const { data: rpcRoles, error: rpcError } = await supabase.rpc("get_my_roles");

  if (!rpcError && rpcRoles) {
    return resolveRole(rpcRoles as string[]);
  }

  if (rpcError) {
    console.warn("[useAuth] get_my_roles RPC failed, falling back to table query:", rpcError.message);
  }

  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);

  if (error) {
    console.error("[useAuth] Failed to load user_roles:", error.message);
    return null;
  }

  const roles = (data ?? []).map((r) => r.role);
  if (roles.length === 0) {
    console.warn(
      "[useAuth] No rows in public.user_roles for this user. " +
        "Promote via SQL: UPDATE public.user_roles SET role = 'admin' WHERE user_id = auth.uid();",
    );
  }
  return resolveRole(roles);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(true);

  const refreshRole = async () => {
    const { data } = await supabase.auth.getSession();
    const currentUser = data.session?.user;
    if (!currentUser) {
      setRole(null);
      return;
    }
    const nextRole = await loadRolesForUser(currentUser.id);
    setRole(nextRole);
  };

  useEffect(() => {
    let active = true;

    const applySession = async (s: Session | null) => {
      if (!active) return;
      setSession(s);
      setUser(s?.user ?? null);

      if (!s?.user) {
        setRole(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      const nextRole = await loadRolesForUser(s.user.id);
      if (!active) return;
      setRole(nextRole);
      setLoading(false);
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      // Defer to avoid Supabase auth deadlocks when calling the client from this callback
      setTimeout(() => {
        applySession(s);
      }, 0);
    });

    supabase.auth.getSession().then(({ data }) => {
      applySession(data.session);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, role, loading, signOut, refreshRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole = "user" | "beta_tester" | "admin";

export interface ManagedUser {
    id: string;
    email: string;
    created_at: string;
    role: UserRole;
    session_count: number;
    last_sign_in_at: string | null;
}

// ─── Guard helper ─────────────────────────────────────────────────────────────
// All admin functions require the caller to have role = 'admin' in user_roles.

async function requireAdmin(supabase: any, userId: string) {
    const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .single();
    if (error || data?.role !== "admin") {
        throw new Error("Unauthorized: admin access required");
    }
}

// ─── List all users ──────────────────────────────────────────────────────────

export const adminListUsers = createServerFn({ method: "POST" })
    .middleware([requireSupabaseAuth])
    .handler(async ({ context }) => {
        const { supabase, userId } = context;
        await requireAdmin(supabase, userId);

        // Use the service-role Supabase client to list auth users
        // We join with user_roles and session counts
        const { data: roles } = await supabase
            .from("user_roles")
            .select("user_id, role");

        const { data: sessions } = await supabase
            .from("telemetry_sessions")
            .select("user_id");

        // Get auth users list — requires service role, falls back if not available
        let authUsers: { id: string; email?: string; created_at: string; last_sign_in_at: string | null }[] = [];
        try {
            const resp = await (supabase as any).auth.admin.listUsers({ perPage: 500 });
            authUsers = resp.data?.users ?? [];
        } catch {
            // service role not configured — return roles data only
        }

        const roleMap = new Map<string, UserRole>(
            (roles ?? []).map((r: any) => [r.user_id, r.role as UserRole])
        );
        const sessionCounts = new Map<string, number>();
        for (const s of sessions ?? []) {
            sessionCounts.set(s.user_id, (sessionCounts.get(s.user_id) ?? 0) + 1);
        }

        const users: ManagedUser[] = authUsers.map((u) => ({
            id: u.id,
            email: u.email ?? "(no email)",
            created_at: u.created_at,
            last_sign_in_at: u.last_sign_in_at,
            role: roleMap.get(u.id) ?? "user",
            session_count: sessionCounts.get(u.id) ?? 0,
        }));

        // Sort: admins first, then beta_testers, then users — by created_at desc within group
        const order: UserRole[] = ["admin", "beta_tester", "user"];
        users.sort((a, b) => {
            const ri = order.indexOf(a.role) - order.indexOf(b.role);
            if (ri !== 0) return ri;
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

        return { users };
    });

// ─── Set role ────────────────────────────────────────────────────────────────

export const adminSetRole = createServerFn({ method: "POST" })
    .middleware([requireSupabaseAuth])
    .inputValidator((data: { targetUserId: string; role: UserRole }) => {
        if (!data.targetUserId) throw new Error("targetUserId required");
        if (!["user", "beta_tester", "admin"].includes(data.role)) throw new Error("invalid role");
        return data;
    })
    .handler(async ({ data, context }) => {
        const { supabase, userId } = context;
        await requireAdmin(supabase, userId);

        // Prevent demoting yourself
        if (data.targetUserId === userId && data.role !== "admin") {
            throw new Error("You cannot demote yourself from admin");
        }

        const { error } = await supabase
            .from("user_roles")
            .upsert(
                { user_id: data.targetUserId, role: data.role, updated_at: new Date().toISOString() },
                { onConflict: "user_id" }
            );

        if (error) throw new Error(error.message);
        return { ok: true };
    });

// ─── Get own role ─────────────────────────────────────────────────────────────

export const getMyRole = createServerFn({ method: "POST" })
    .middleware([requireSupabaseAuth])
    .handler(async ({ context }) => {
        const { supabase, userId } = context;
        const { data } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", userId)
            .maybeSingle();
        return { role: (data?.role as UserRole) ?? "user" };
    });

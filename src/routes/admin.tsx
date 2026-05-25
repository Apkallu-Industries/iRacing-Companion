import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
import {
  adminListUsers,
  adminSetRole,
  getMyRole,
  type ManagedUser,
  type UserRole,
} from "@/lib/admin.functions";
import { toast } from "sonner";
import {
  Shield,
  Users,
  Star,
  User,
  ChevronDown,
  Loader2,
  RefreshCw,
  Search,
  Activity,
  Calendar,
  Database,
  Lock,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin — Pit Wall" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminPage,
});

// ─── Role badge config ────────────────────────────────────────────────────────

const ROLE_CONFIG: Record<UserRole, { label: string; color: string; icon: React.ReactNode }> = {
  admin: {
    label: "Admin",
    color: "text-racing-red border-racing-red/30 bg-racing-red/10",
    icon: <Shield className="h-3 w-3" />,
  },
  beta_tester: {
    label: "Beta Tester",
    color: "text-racing-cyan border-racing-cyan/30 bg-racing-cyan/10",
    icon: <Star className="h-3 w-3" />,
  },
  user: {
    label: "User",
    color: "text-muted-foreground border-border bg-rail",
    icon: <User className="h-3 w-3" />,
  },
};

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-panel p-4">
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        {icon}
        <span className="text-xs uppercase tracking-wider font-mono">{label}</span>
      </div>
      <div className="text-2xl font-bold font-mono text-foreground">{value}</div>
    </div>
  );
}

// ─── Role selector dropdown ───────────────────────────────────────────────────

function RoleSelect({
  userId,
  current,
  selfId,
  onUpdate,
}: {
  userId: string;
  current: UserRole;
  selfId: string;
  onUpdate: (uid: string, role: UserRole) => void;
}) {
  const [busy, setBusy] = useState(false);
  const isSelf = userId === selfId;
  const roles: UserRole[] = ["user", "beta_tester", "admin"];

  const handleChange = async (role: UserRole) => {
    if (role === current) return;
    setBusy(true);
    try {
      await adminSetRole({ data: { targetUserId: userId, role } });
      onUpdate(userId, role);
      toast.success(`Role updated to ${ROLE_CONFIG[role].label}`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const cfg = ROLE_CONFIG[current];

  return (
    <div className="relative">
      <select
        value={current}
        disabled={busy || isSelf}
        onChange={(e) => handleChange(e.target.value as UserRole)}
        className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-mono cursor-pointer appearance-none pr-6 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${cfg.color}`}
        title={isSelf ? "You cannot change your own role" : undefined}
      >
        {roles.map((r) => (
          <option key={r} value={r}>
            {ROLE_CONFIG[r].label}
          </option>
        ))}
      </select>
      {busy ? (
        <Loader2 className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 animate-spin text-muted-foreground" />
      ) : (
        <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

function AdminPage() {
  const { user, loading } = useAuth();
  const [myRole, setMyRole] = useState<UserRole | null>(null);
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [fetching, setFetching] = useState(false);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<UserRole | "all">("all");

  // Load own role first to gate the page
  useEffect(() => {
    if (!user) return;
    getMyRole()
      .then((r) => setMyRole(r.role))
      .catch(() => setMyRole("user"));
  }, [user]);

  const load = useCallback(async () => {
    setFetching(true);
    try {
      const res = await adminListUsers();
      setUsers(res.users);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    if (myRole === "admin") load();
  }, [myRole, load]);

  const handleRoleUpdate = useCallback((uid: string, role: UserRole) => {
    setUsers((prev) => prev.map((u) => (u.id === uid ? { ...u, role } : u)));
  }, []);

  // ── Derived stats ──
  const adminCount = users.filter((u) => u.role === "admin").length;
  const betaCount = users.filter((u) => u.role === "beta_tester").length;
  const totalSessions = users.reduce((acc, u) => acc + u.session_count, 0);

  // ── Filtered ──
  const filtered = users.filter((u) => {
    const matchSearch =
      !search || u.email.toLowerCase().includes(search.toLowerCase()) || u.id.includes(search);
    const matchRole = filterRole === "all" || u.role === filterRole;
    return matchSearch && matchRole;
  });

  function fmtDate(s: string | null) {
    if (!s) return "—";
    return new Date(s).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "2-digit",
    });
  }

  // ── Loading / auth gates ──
  if (loading || myRole === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background gap-4">
        <Lock className="h-8 w-8 text-muted-foreground" />
        <p className="text-muted-foreground text-sm">Sign in to access the admin panel.</p>
        <Link
          to="/auth"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Sign in
        </Link>
      </div>
    );
  }

  if (myRole !== "admin") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background gap-4">
        <Lock className="h-8 w-8 text-racing-red/60" />
        <p className="text-sm text-muted-foreground">
          You need <span className="text-racing-red font-semibold">Admin</span> access to view this
          page.
        </p>
        <Link to="/" className="text-xs text-muted-foreground underline hover:text-foreground">
          ← Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader>
        <Shield className="h-3.5 w-3.5 text-racing-red" />
        <span className="font-mono uppercase tracking-wider">Admin Panel</span>
        <Link to="/sessions" className="ml-3 text-muted-foreground hover:text-foreground text-xs">
          Sessions
        </Link>
        <Link to="/roadmap" className="ml-3 text-muted-foreground hover:text-foreground text-xs">
          Roadmap
        </Link>
      </AppHeader>

      <main className="mx-auto max-w-6xl px-6 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            label="Total Users"
            value={users.length}
            icon={<Users className="h-3.5 w-3.5" />}
          />
          <StatCard
            label="Admins"
            value={adminCount}
            icon={<Shield className="h-3.5 w-3.5 text-racing-red" />}
          />
          <StatCard
            label="Beta Testers"
            value={betaCount}
            icon={<Star className="h-3.5 w-3.5 text-racing-cyan" />}
          />
          <StatCard
            label="Total Sessions"
            value={totalSessions}
            icon={<Database className="h-3.5 w-3.5 text-primary" />}
          />
        </div>

        {/* Beta Tester onboarding note */}
        <div className="rounded-lg border border-racing-cyan/20 bg-racing-cyan/5 px-5 py-4">
          <div className="flex items-start gap-3">
            <Star className="h-4 w-4 text-racing-cyan mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-semibold text-foreground">Beta Tester access</p>
              <p className="text-xs text-muted-foreground mt-1">
                Users promoted to <strong className="text-racing-cyan">Beta Tester</strong> get free
                access to all Pro features during the paid rollout period. Once Stripe billing is
                live, their role grants them a permanent free subscription — ideal for community
                contributors, streamers, and sim coaches helping you shape the product.
              </p>
            </div>
          </div>
        </div>

        {/* User management table */}
        <section>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-semibold text-foreground">User Management</h2>
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search email or ID…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-8 rounded-md border border-border bg-rail pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary w-56"
                />
              </div>
              {/* Role filter */}
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value as any)}
                className="h-8 rounded-md border border-border bg-rail px-2 text-xs text-foreground focus:outline-none focus:border-primary"
              >
                <option value="all">All roles</option>
                <option value="admin">Admin</option>
                <option value="beta_tester">Beta Tester</option>
                <option value="user">User</option>
              </select>
              {/* Refresh */}
              <button
                onClick={load}
                disabled={fetching}
                className="flex h-8 items-center gap-1.5 rounded-md border border-border bg-rail px-3 text-xs text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${fetching ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          </div>

          {fetching && users.length === 0 ? (
            <div className="flex items-center justify-center rounded-lg border border-border bg-panel py-16 gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading users…</span>
            </div>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-rail text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3 text-left">User</th>
                    <th className="px-4 py-3 text-left hidden sm:table-cell">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Joined
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left hidden md:table-cell">
                      <div className="flex items-center gap-1">
                        <Activity className="h-3 w-3" /> Last Sign-in
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center hidden sm:table-cell">
                      <div className="flex items-center justify-center gap-1">
                        <Database className="h-3 w-3" /> Sessions
                      </div>
                    </th>
                    <th className="px-4 py-3 text-right">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-10 text-center text-sm text-muted-foreground"
                      >
                        No users match your search.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((u) => {
                      const cfg = ROLE_CONFIG[u.role];
                      return (
                        <tr key={u.id} className="bg-panel hover:bg-rail transition-colors">
                          {/* User */}
                          <td className="px-4 py-3">
                            <div className="font-medium text-foreground truncate max-w-[200px]">
                              {u.email}
                            </div>
                            <div className="text-xs text-muted-foreground font-mono mt-0.5 hidden md:block truncate">
                              {u.id}
                            </div>
                          </td>
                          {/* Joined */}
                          <td className="px-4 py-3 text-xs text-muted-foreground hidden sm:table-cell">
                            {fmtDate(u.created_at)}
                          </td>
                          {/* Last sign-in */}
                          <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">
                            {fmtDate(u.last_sign_in_at)}
                          </td>
                          {/* Sessions */}
                          <td className="px-4 py-3 text-center hidden sm:table-cell">
                            <span
                              className={`text-xs font-mono ${u.session_count > 0 ? "text-primary" : "text-muted-foreground/40"}`}
                            >
                              {u.session_count}
                            </span>
                          </td>
                          {/* Role */}
                          <td className="px-4 py-3 text-right">
                            <RoleSelect
                              userId={u.id}
                              current={u.role}
                              selfId={user.id}
                              onUpdate={handleRoleUpdate}
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
              {filtered.length > 0 && (
                <div className="border-t border-border bg-rail px-4 py-2 text-xs text-muted-foreground">
                  Showing {filtered.length} of {users.length} users
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

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
import { getBridgeUrl } from "@/lib/bridgeDataClient";
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
  Key,
  Copy,
  Check,
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

// ─── Cryptographic License Generation (Browser-Native) ─────────────────────────

async function signLicensePayload(hwid: string, tier: string, expires: string): Promise<string> {
  const MASTER_SECRET = "iracing_companion_secret_2026";
  const dataStr = JSON.stringify({ hwid, tier, expires });

  const encoder = new TextEncoder();
  const secretKeyData = encoder.encode(MASTER_SECRET);
  const data = encoder.encode(dataStr);

  const cryptoKey = await window.crypto.subtle.importKey(
    "raw",
    secretKeyData,
    { name: "HMAC", hash: { name: "SHA-256" } },
    false,
    ["sign"],
  );

  const signatureBuffer = await window.crypto.subtle.sign("HMAC", cryptoKey, data);

  const hashArray = Array.from(new Uint8Array(signatureBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex.substring(0, 16).toUpperCase();
}

async function generateLicenseKeyBrowser(
  hwid: string,
  tier: string,
  expires: string,
): Promise<string> {
  const payload = { hwid, tier, expires };
  const payloadBase64 = btoa(JSON.stringify(payload));
  const signature = await signLicensePayload(hwid, tier, expires);
  return `${payloadBase64}.${signature}`;
}

// ─── Main component ───────────────────────────────────────────────────────────

function AdminPage() {
  const { user, loading } = useAuth();
  const [myRole, setMyRole] = useState<UserRole | null>(null);
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [fetching, setFetching] = useState(false);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<UserRole | "all">("all");

  // Admin tab switching
  const [adminTab, setAdminTab] = useState<"users" | "keygen">("users");

  // Admin Credentials and Gating States
  const [adminUsernameInput, setAdminUsernameInput] = useState("");
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [localAuthorized, setLocalAuthorized] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("pitwall_admin_auth") === "true";
    }
    return false;
  });

  const isGitHubAdmin =
    user?.email?.toLowerCase().includes("danym") ||
    user?.app_metadata?.provider === "github" ||
    (user as any)?.identities?.some((id: any) => id.provider === "github");

  const handleAdminCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminUsernameInput === "admin" && adminPasswordInput === "pitwall_admin_2026") {
      setLocalAuthorized(true);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("pitwall_admin_auth", "true");
      }
      toast.success("Welcome, System Administrator!");
    } else {
      toast.error("Invalid administrator credentials.");
    }
  };

  // License Generator State
  const [targetHwid, setTargetHwid] = useState("");
  const [selectedTier, setSelectedTier] = useState<"plus" | "pro">("pro");
  const [expiryPreset, setExpiryPreset] = useState<"never" | "30" | "365">("never");
  const [generatedKey, setGeneratedKey] = useState("");
  const [copiedKey, setCopiedKey] = useState(false);
  const [pushingToBridge, setPushingToBridge] = useState(false);

  const handleGenerateKey = async () => {
    if (!targetHwid) {
      toast.error("Please enter a valid Hardware ID.");
      return;
    }
    const cleanHwid = targetHwid.toUpperCase().trim();
    if (cleanHwid.length !== 16) {
      toast.error("Hardware ID must be exactly 16 hex characters.");
      return;
    }

    let expires = "never";
    if (expiryPreset !== "never") {
      const days = parseInt(expiryPreset, 10);
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + days);
      expires = expiryDate.toISOString().slice(0, 10); // YYYY-MM-DD
    }

    try {
      const key = await generateLicenseKeyBrowser(cleanHwid, selectedTier, expires);
      setGeneratedKey(key);
      toast.success("Cryptographic license key generated offline!");
    } catch (e) {
      toast.error("Failed to generate license key.");
    }
  };

  const copyKeyToClipboard = () => {
    if (!generatedKey) return;
    navigator.clipboard.writeText(generatedKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
    toast.success("License key copied to clipboard.");
  };

  const handlePushToLocalBridge = async () => {
    if (!generatedKey) return;
    setPushingToBridge(true);
    try {
      const wsUrl = getBridgeUrl();
      const httpUrl = wsUrl.replace(/^ws/, "http");

      const res = await fetch(`${httpUrl}/api/license`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: generatedKey }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(
          `Key pushed and activated on your local bridge! Mode: ${data.tier.toUpperCase()}`,
        );
      } else {
        toast.error(data.error || "Bridge rejected the license key.");
      }
    } catch (e) {
      toast.error("Local bridge is not reachable. Make sure it is started on port 3001.");
    } finally {
      setPushingToBridge(false);
    }
  };

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

  const isAuthorized = isGitHubAdmin || localAuthorized || myRole === "admin";

  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:2.5rem_2.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-10 pointer-events-none" />
        <div className="relative z-10 w-full max-w-sm rounded-lg border border-border bg-panel-2 p-6 shadow-2xl">
          <div className="flex flex-col items-center text-center">
            <div className="size-10 rounded-full bg-racing-red/10 border border-racing-red/20 flex items-center justify-center mb-3 text-racing-red animate-pulse">
              <Lock className="h-4 w-4" />
            </div>
            <h2 className="font-mono text-xs uppercase tracking-widest text-foreground font-semibold">
              Pit Wall Admin Gate
            </h2>
            <p className="mt-1 text-[10px] uppercase font-mono tracking-wider text-muted-foreground">
              Access is restricted to authorized developers.
            </p>
          </div>

          <form
            onSubmit={handleAdminCredentialsSubmit}
            className="mt-6 space-y-4 font-mono text-[11px]"
          >
            <div className="space-y-1.5">
              <label className="text-muted-foreground uppercase tracking-wider block">
                Username
              </label>
              <input
                type="text"
                value={adminUsernameInput}
                onChange={(e) => setAdminUsernameInput(e.target.value)}
                placeholder="system_admin"
                className="w-full h-8 rounded border border-border-strong bg-background px-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-racing-red"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-muted-foreground uppercase tracking-wider block">
                Password
              </label>
              <input
                type="password"
                value={adminPasswordInput}
                onChange={(e) => setAdminPasswordInput(e.target.value)}
                placeholder="••••••••••••"
                className="w-full h-8 rounded border border-border-strong bg-background px-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-racing-red"
              />
            </div>
            <button
              type="submit"
              className="mt-6 flex w-full items-center justify-center gap-1.5 h-9 rounded bg-racing-red hover:bg-red-600 px-4 font-semibold text-foreground uppercase tracking-wider transition-all duration-300 cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:scale-102"
            >
              Verify Identity
            </button>
          </form>
          <div className="mt-4 text-center">
            <Link
              to="/"
              className="text-[10px] font-mono text-muted-foreground hover:text-muted-foreground uppercase tracking-wider underline"
            >
              ← Return Home
            </Link>
          </div>
        </div>
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

      <main className="w-full max-w-none px-4 md:px-12 lg:px-16 py-8 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-border bg-panel/30 font-mono text-xs uppercase tracking-wider mb-6 shrink-0">
          <button
            onClick={() => setAdminTab("users")}
            className={`px-6 py-3 border-b-2 font-semibold transition-all cursor-pointer ${
              adminTab === "users"
                ? "border-racing-red text-foreground bg-panel"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            User Management
          </button>
          <button
            onClick={() => setAdminTab("keygen")}
            className={`px-6 py-3 border-b-2 font-semibold transition-all cursor-pointer ${
              adminTab === "keygen"
                ? "border-racing-red text-foreground bg-panel"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            License Key Generator
          </button>
        </div>

        {adminTab === "users" ? (
          <>
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
                    Users promoted to <strong className="text-racing-cyan">Beta Tester</strong> get
                    free access to all Pro features during the paid rollout period. Once Stripe
                    billing is live, their role grants them a permanent free subscription — ideal
                    for community contributors, streamers, and sim coaches helping you shape the
                    product.
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
          </>
        ) : (
          /* Keygen tab content */
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Column 1: Config */}
            <div className="md:col-span-5 bg-panel border border-border rounded-lg p-5 space-y-4 font-mono text-[11px]">
              <div className="border-b border-border/40 pb-2 flex items-center gap-1.5 text-foreground">
                <Key className="h-4 w-4 text-racing-red animate-pulse" />
                <h2 className="text-xs uppercase tracking-wider font-semibold">
                  Generate License Key
                </h2>
              </div>

              <div className="space-y-1.5">
                <label className="text-muted-foreground uppercase tracking-wider block">
                  Target HWID (16-char Hex)
                </label>
                <input
                  type="text"
                  maxLength={16}
                  value={targetHwid}
                  onChange={(e) =>
                    setTargetHwid(e.target.value.toUpperCase().replace(/[^0-9A-F]/i, ""))
                  }
                  placeholder="B3F2A79C4E0B615F"
                  className="w-full h-8 rounded border border-border bg-background px-3 font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-racing-red text-xs uppercase"
                />
                <p className="text-[9px] text-muted-foreground leading-normal uppercase">
                  Paste the 16-character Hardware ID found in the user's Settings {"->"} License
                  panel.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-muted-foreground uppercase tracking-wider block">
                  License Tier
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-foreground">
                    <input
                      type="radio"
                      checked={selectedTier === "plus"}
                      onChange={() => setSelectedTier("plus")}
                      className="cursor-pointer accent-racing-red"
                    />
                    <span>PLUS WORKBOOK</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-foreground">
                    <input
                      type="radio"
                      checked={selectedTier === "pro"}
                      onChange={() => setSelectedTier("pro")}
                      className="cursor-pointer accent-racing-red"
                    />
                    <span>PRO REAL-TIME</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-muted-foreground uppercase tracking-wider block">
                  Duration / Expiration
                </label>
                <select
                  value={expiryPreset}
                  onChange={(e) => setExpiryPreset(e.target.value as any)}
                  className="w-full h-8 rounded border border-border bg-background px-2 text-foreground focus:outline-none focus:border-racing-red cursor-pointer"
                >
                  <option value="never">Lifetime (No Expiration)</option>
                  <option value="30">30 Days (Demo/Trial)</option>
                  <option value="365">1 Year (Annual)</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleGenerateKey}
                disabled={!targetHwid || targetHwid.length !== 16}
                className="w-full flex items-center justify-center gap-2 h-9 rounded bg-racing-red hover:bg-red-600 px-4 font-semibold text-foreground uppercase tracking-wider transition-all duration-300 disabled:opacity-40 disabled:pointer-events-none cursor-pointer mt-4"
              >
                <Activity className="h-4 w-4" />
                Generate License Key
              </button>
            </div>

            {/* Column 2: Output */}
            <div className="md:col-span-7 bg-panel border border-border rounded-lg p-5 space-y-4 font-mono text-[11px]">
              <div className="border-b border-border/40 pb-2 text-foreground">
                <h2 className="text-xs uppercase tracking-wider font-semibold">
                  Signed Key Output
                </h2>
              </div>

              {generatedKey ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-1.5">
                    <label className="text-muted-foreground uppercase tracking-wider block">
                      Generated Cryptographic Payload
                    </label>
                    <textarea
                      readOnly
                      rows={5}
                      value={generatedKey}
                      className="w-full rounded border border-border bg-background p-3 text-emerald-400 select-all font-mono text-[10px] leading-relaxed break-all focus:outline-none"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={copyKeyToClipboard}
                      className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded border border-border hover:bg-accent text-foreground font-semibold uppercase tracking-wider transition-all cursor-pointer"
                    >
                      {copiedKey ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          Copy to Clipboard
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handlePushToLocalBridge}
                      disabled={pushingToBridge}
                      className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded bg-primary hover:opacity-90 text-primary-foreground font-semibold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw
                        className={`h-3.5 w-3.5 ${pushingToBridge ? "animate-spin" : ""}`}
                      />
                      One-Click Local Deploy
                    </button>
                  </div>
                  <p className="text-[9px] text-muted-foreground leading-normal uppercase">
                    Copy the payload above and send it to the client PC. Alternatively, if your
                    local bridge is running locally on this PC on port 3001, click "One-Click Local
                    Deploy" to instantly activate it!
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground border border-dashed border-border/60 rounded-md">
                  <Lock className="h-8 w-8 text-zinc-800 mb-2 animate-bounce" />
                  <span className="text-[10px] uppercase tracking-wider">
                    Awaiting license generation configuration...
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

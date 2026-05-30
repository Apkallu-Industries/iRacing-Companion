import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { J as useAuth, q as getBridgeUrl } from "./router-D8VllJ-f.js";
import { A as AppHeader } from "./AppHeader-B_iAqR4F.js";
import { b as createServerFn, e as createSsrRpc } from "../server.js";
import { r as requireSupabaseAuth } from "./auth-middleware-Cz-8T2yV.js";
import { toast } from "sonner";
import { Loader2, Lock, Shield, Users, Star, Database, Search, RefreshCw, Calendar, Activity, Key, Check, Copy, User, ChevronDown } from "lucide-react";
import "@tanstack/react-query";
import "./charts-IpNGhCyp.js";
import "@supabase/supabase-js";
import "zustand";
import "zustand/middleware";
import "zod";
import "./schema-BU1MXGgz.js";
import "@radix-ui/react-dialog";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-tabs";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "./client.server-Y-0AANJ4.js";
import "@radix-ui/react-scroll-area";
import "./tts.functions-CbCKt0n5.js";
import "./BackButton-D1X33uYM.js";
import "./useRuntimeStatus-C58D6jGD.js";
import "seroval";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
const adminListUsers = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("35cf6cc28f61c798a570ec39672552de8ed250f60706565e25b34a66f0c5b240"));
const adminSetRole = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((data) => {
  if (!data.targetUserId) throw new Error("targetUserId required");
  if (!["user", "beta_tester", "admin"].includes(data.role)) throw new Error("invalid role");
  return data;
}).handler(createSsrRpc("154da85bc7e5915df5164155bbb68a97441082079312d44aab513dabc82f59c3"));
const getMyRole = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("e2507865c01468809aa67f84f243facd748d53ebf53d1a04baa0f86f26aed510"));
const ROLE_CONFIG = {
  admin: {
    label: "Admin",
    color: "text-racing-red border-racing-red/30 bg-racing-red/10",
    icon: /* @__PURE__ */ jsx(Shield, { className: "h-3 w-3" })
  },
  beta_tester: {
    label: "Beta Tester",
    color: "text-racing-cyan border-racing-cyan/30 bg-racing-cyan/10",
    icon: /* @__PURE__ */ jsx(Star, { className: "h-3 w-3" })
  },
  user: {
    label: "User",
    color: "text-muted-foreground border-border bg-rail",
    icon: /* @__PURE__ */ jsx(User, { className: "h-3 w-3" })
  }
};
function StatCard({
  label,
  value,
  icon
}) {
  return /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-border bg-panel p-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-muted-foreground mb-1", children: [
      icon,
      /* @__PURE__ */ jsx("span", { className: "text-xs uppercase tracking-wider font-mono", children: label })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold font-mono text-foreground", children: value })
  ] });
}
function RoleSelect({
  userId,
  current,
  selfId,
  onUpdate
}) {
  const [busy, setBusy] = useState(false);
  const isSelf = userId === selfId;
  const roles = ["user", "beta_tester", "admin"];
  const handleChange = async (role) => {
    if (role === current) return;
    setBusy(true);
    try {
      await adminSetRole({
        data: {
          targetUserId: userId,
          role
        }
      });
      onUpdate(userId, role);
      toast.success(`Role updated to ${ROLE_CONFIG[role].label}`);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };
  const cfg = ROLE_CONFIG[current];
  return /* @__PURE__ */ jsxs("div", { className: "relative", children: [
    /* @__PURE__ */ jsx("select", { value: current, disabled: busy || isSelf, onChange: (e) => handleChange(e.target.value), className: `flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-mono cursor-pointer appearance-none pr-6 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${cfg.color}`, title: isSelf ? "You cannot change your own role" : void 0, children: roles.map((r) => /* @__PURE__ */ jsx("option", { value: r, children: ROLE_CONFIG[r].label }, r)) }),
    busy ? /* @__PURE__ */ jsx(Loader2, { className: "pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 animate-spin text-muted-foreground" }) : /* @__PURE__ */ jsx(ChevronDown, { className: "pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" })
  ] });
}
async function signLicensePayload(hwid, tier, expires) {
  const MASTER_SECRET = "iracing_companion_secret_2026";
  const dataStr = JSON.stringify({
    hwid,
    tier,
    expires
  });
  const encoder = new TextEncoder();
  const secretKeyData = encoder.encode(MASTER_SECRET);
  const data = encoder.encode(dataStr);
  const cryptoKey = await window.crypto.subtle.importKey("raw", secretKeyData, {
    name: "HMAC",
    hash: {
      name: "SHA-256"
    }
  }, false, ["sign"]);
  const signatureBuffer = await window.crypto.subtle.sign("HMAC", cryptoKey, data);
  const hashArray = Array.from(new Uint8Array(signatureBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex.substring(0, 16).toUpperCase();
}
async function generateLicenseKeyBrowser(hwid, tier, expires) {
  const payload = {
    hwid,
    tier,
    expires
  };
  const payloadBase64 = btoa(JSON.stringify(payload));
  const signature = await signLicensePayload(hwid, tier, expires);
  return `${payloadBase64}.${signature}`;
}
function AdminPage() {
  const {
    user,
    loading
  } = useAuth();
  const [myRole, setMyRole] = useState(null);
  const [users, setUsers] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [adminTab, setAdminTab] = useState("users");
  const [adminUsernameInput, setAdminUsernameInput] = useState("");
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [localAuthorized, setLocalAuthorized] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("pitwall_admin_auth") === "true";
    }
    return false;
  });
  const isGitHubAdmin = user?.email?.toLowerCase().includes("danym") || user?.app_metadata?.provider === "github" || user?.identities?.some((id) => id.provider === "github");
  const handleAdminCredentialsSubmit = (e) => {
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
  const [targetHwid, setTargetHwid] = useState("");
  const [selectedTier, setSelectedTier] = useState("pro");
  const [expiryPreset, setExpiryPreset] = useState("never");
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
      const expiryDate = /* @__PURE__ */ new Date();
      expiryDate.setDate(expiryDate.getDate() + days);
      expires = expiryDate.toISOString().slice(0, 10);
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
    setTimeout(() => setCopiedKey(false), 2e3);
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
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          key: generatedKey
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Key pushed and activated on your local bridge! Mode: ${data.tier.toUpperCase()}`);
      } else {
        toast.error(data.error || "Bridge rejected the license key.");
      }
    } catch (e) {
      toast.error("Local bridge is not reachable. Make sure it is started on port 3001.");
    } finally {
      setPushingToBridge(false);
    }
  };
  useEffect(() => {
    if (!user) return;
    getMyRole().then((r) => setMyRole(r.role)).catch(() => setMyRole("user"));
  }, [user]);
  const load = useCallback(async () => {
    setFetching(true);
    try {
      const res = await adminListUsers();
      setUsers(res.users);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setFetching(false);
    }
  }, []);
  useEffect(() => {
    if (myRole === "admin") load();
  }, [myRole, load]);
  const handleRoleUpdate = useCallback((uid, role) => {
    setUsers((prev) => prev.map((u) => u.id === uid ? {
      ...u,
      role
    } : u));
  }, []);
  const adminCount = users.filter((u) => u.role === "admin").length;
  const betaCount = users.filter((u) => u.role === "beta_tester").length;
  const totalSessions = users.reduce((acc, u) => acc + u.session_count, 0);
  const filtered = users.filter((u) => {
    const matchSearch = !search || u.email.toLowerCase().includes(search.toLowerCase()) || u.id.includes(search);
    const matchRole = filterRole === "all" || u.role === filterRole;
    return matchSearch && matchRole;
  });
  function fmtDate(s) {
    if (!s) return "—";
    return new Date(s).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "2-digit"
    });
  }
  if (loading || myRole === null) {
    return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background", children: /* @__PURE__ */ jsx(Loader2, { className: "h-5 w-5 animate-spin text-muted-foreground" }) });
  }
  if (!user) {
    return /* @__PURE__ */ jsxs("div", { className: "flex min-h-screen flex-col items-center justify-center bg-background gap-4", children: [
      /* @__PURE__ */ jsx(Lock, { className: "h-8 w-8 text-muted-foreground" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-sm", children: "Sign in to access the admin panel." }),
      /* @__PURE__ */ jsx(Link, { to: "/auth", className: "rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground", children: "Sign in" })
    ] });
  }
  const isAuthorized = isGitHubAdmin || localAuthorized || myRole === "admin";
  if (!isAuthorized) {
    return /* @__PURE__ */ jsxs("div", { className: "flex min-h-screen items-center justify-center bg-background p-4", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:2.5rem_2.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-10 pointer-events-none" }),
      /* @__PURE__ */ jsxs("div", { className: "relative z-10 w-full max-w-sm rounded-lg border border-border bg-panel-2 p-6 shadow-2xl", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "size-10 rounded-full bg-racing-red/10 border border-racing-red/20 flex items-center justify-center mb-3 text-racing-red animate-pulse", children: /* @__PURE__ */ jsx(Lock, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsx("h2", { className: "font-mono text-xs uppercase tracking-widest text-foreground font-semibold", children: "Pit Wall Admin Gate" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-[10px] uppercase font-mono tracking-wider text-muted-foreground", children: "Access is restricted to authorized developers." })
        ] }),
        /* @__PURE__ */ jsxs("form", { onSubmit: handleAdminCredentialsSubmit, className: "mt-6 space-y-4 font-mono text-[11px]", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsx("label", { className: "text-muted-foreground uppercase tracking-wider block", children: "Username" }),
            /* @__PURE__ */ jsx("input", { type: "text", value: adminUsernameInput, onChange: (e) => setAdminUsernameInput(e.target.value), placeholder: "system_admin", className: "w-full h-8 rounded border border-border-strong bg-background px-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-racing-red" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsx("label", { className: "text-muted-foreground uppercase tracking-wider block", children: "Password" }),
            /* @__PURE__ */ jsx("input", { type: "password", value: adminPasswordInput, onChange: (e) => setAdminPasswordInput(e.target.value), placeholder: "••••••••••••", className: "w-full h-8 rounded border border-border-strong bg-background px-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-racing-red" })
          ] }),
          /* @__PURE__ */ jsx("button", { type: "submit", className: "mt-6 flex w-full items-center justify-center gap-1.5 h-9 rounded bg-racing-red hover:bg-red-600 px-4 font-semibold text-foreground uppercase tracking-wider transition-all duration-300 cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:scale-102", children: "Verify Identity" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-4 text-center", children: /* @__PURE__ */ jsx(Link, { to: "/", className: "text-[10px] font-mono text-muted-foreground hover:text-muted-foreground uppercase tracking-wider underline", children: "← Return Home" }) })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background text-foreground", children: [
    /* @__PURE__ */ jsxs(AppHeader, { children: [
      /* @__PURE__ */ jsx(Shield, { className: "h-3.5 w-3.5 text-racing-red" }),
      /* @__PURE__ */ jsx("span", { className: "font-mono uppercase tracking-wider", children: "Admin Panel" }),
      /* @__PURE__ */ jsx(Link, { to: "/sessions", className: "ml-3 text-muted-foreground hover:text-foreground text-xs", children: "Sessions" }),
      /* @__PURE__ */ jsx(Link, { to: "/roadmap", className: "ml-3 text-muted-foreground hover:text-foreground text-xs", children: "Roadmap" })
    ] }),
    /* @__PURE__ */ jsxs("main", { className: "w-full max-w-none px-4 md:px-12 lg:px-16 py-8 space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex border-b border-border bg-panel/30 font-mono text-xs uppercase tracking-wider mb-6 shrink-0", children: [
        /* @__PURE__ */ jsx("button", { onClick: () => setAdminTab("users"), className: `px-6 py-3 border-b-2 font-semibold transition-all cursor-pointer ${adminTab === "users" ? "border-racing-red text-foreground bg-panel" : "border-transparent text-muted-foreground hover:text-foreground"}`, children: "User Management" }),
        /* @__PURE__ */ jsx("button", { onClick: () => setAdminTab("keygen"), className: `px-6 py-3 border-b-2 font-semibold transition-all cursor-pointer ${adminTab === "keygen" ? "border-racing-red text-foreground bg-panel" : "border-transparent text-muted-foreground hover:text-foreground"}`, children: "License Key Generator" })
      ] }),
      adminTab === "users" ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3 sm:grid-cols-4", children: [
          /* @__PURE__ */ jsx(StatCard, { label: "Total Users", value: users.length, icon: /* @__PURE__ */ jsx(Users, { className: "h-3.5 w-3.5" }) }),
          /* @__PURE__ */ jsx(StatCard, { label: "Admins", value: adminCount, icon: /* @__PURE__ */ jsx(Shield, { className: "h-3.5 w-3.5 text-racing-red" }) }),
          /* @__PURE__ */ jsx(StatCard, { label: "Beta Testers", value: betaCount, icon: /* @__PURE__ */ jsx(Star, { className: "h-3.5 w-3.5 text-racing-cyan" }) }),
          /* @__PURE__ */ jsx(StatCard, { label: "Total Sessions", value: totalSessions, icon: /* @__PURE__ */ jsx(Database, { className: "h-3.5 w-3.5 text-primary" }) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-racing-cyan/20 bg-racing-cyan/5 px-5 py-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsx(Star, { className: "h-4 w-4 text-racing-cyan mt-0.5 shrink-0" }),
          /* @__PURE__ */ jsxs("div", { className: "text-sm", children: [
            /* @__PURE__ */ jsx("p", { className: "font-semibold text-foreground", children: "Beta Tester access" }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
              "Users promoted to ",
              /* @__PURE__ */ jsx("strong", { className: "text-racing-cyan", children: "Beta Tester" }),
              " get free access to all Pro features during the paid rollout period. Once Stripe billing is live, their role grants them a permanent free subscription — ideal for community contributors, streamers, and sim coaches helping you shape the product."
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxs("section", { children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
            /* @__PURE__ */ jsx("h2", { className: "font-semibold text-foreground", children: "User Management" }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                /* @__PURE__ */ jsx(Search, { className: "pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" }),
                /* @__PURE__ */ jsx("input", { type: "text", placeholder: "Search email or ID…", value: search, onChange: (e) => setSearch(e.target.value), className: "h-8 rounded-md border border-border bg-rail pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary w-56" })
              ] }),
              /* @__PURE__ */ jsxs("select", { value: filterRole, onChange: (e) => setFilterRole(e.target.value), className: "h-8 rounded-md border border-border bg-rail px-2 text-xs text-foreground focus:outline-none focus:border-primary", children: [
                /* @__PURE__ */ jsx("option", { value: "all", children: "All roles" }),
                /* @__PURE__ */ jsx("option", { value: "admin", children: "Admin" }),
                /* @__PURE__ */ jsx("option", { value: "beta_tester", children: "Beta Tester" }),
                /* @__PURE__ */ jsx("option", { value: "user", children: "User" })
              ] }),
              /* @__PURE__ */ jsxs("button", { onClick: load, disabled: fetching, className: "flex h-8 items-center gap-1.5 rounded-md border border-border bg-rail px-3 text-xs text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors", children: [
                /* @__PURE__ */ jsx(RefreshCw, { className: `h-3.5 w-3.5 ${fetching ? "animate-spin" : ""}` }),
                "Refresh"
              ] })
            ] })
          ] }),
          fetching && users.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center rounded-lg border border-border bg-panel py-16 gap-2 text-muted-foreground", children: [
            /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }),
            /* @__PURE__ */ jsx("span", { className: "text-sm", children: "Loading users…" })
          ] }) : /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-border overflow-hidden", children: [
            /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
              /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-border bg-rail text-xs font-mono uppercase tracking-wider text-muted-foreground", children: [
                /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left", children: "User" }),
                /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left hidden sm:table-cell", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx(Calendar, { className: "h-3 w-3" }),
                  " Joined"
                ] }) }),
                /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left hidden md:table-cell", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx(Activity, { className: "h-3 w-3" }),
                  " Last Sign-in"
                ] }) }),
                /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-center hidden sm:table-cell", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-1", children: [
                  /* @__PURE__ */ jsx(Database, { className: "h-3 w-3" }),
                  " Sessions"
                ] }) }),
                /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-right", children: "Role" })
              ] }) }),
              /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border", children: filtered.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 5, className: "px-4 py-10 text-center text-sm text-muted-foreground", children: "No users match your search." }) }) : filtered.map((u) => {
                ROLE_CONFIG[u.role];
                return /* @__PURE__ */ jsxs("tr", { className: "bg-panel hover:bg-rail transition-colors", children: [
                  /* @__PURE__ */ jsxs("td", { className: "px-4 py-3", children: [
                    /* @__PURE__ */ jsx("div", { className: "font-medium text-foreground truncate max-w-[200px]", children: u.email }),
                    /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground font-mono mt-0.5 hidden md:block truncate", children: u.id })
                  ] }),
                  /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-xs text-muted-foreground hidden sm:table-cell", children: fmtDate(u.created_at) }),
                  /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-xs text-muted-foreground hidden md:table-cell", children: fmtDate(u.last_sign_in_at) }),
                  /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-center hidden sm:table-cell", children: /* @__PURE__ */ jsx("span", { className: `text-xs font-mono ${u.session_count > 0 ? "text-primary" : "text-muted-foreground/40"}`, children: u.session_count }) }),
                  /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-right", children: /* @__PURE__ */ jsx(RoleSelect, { userId: u.id, current: u.role, selfId: user.id, onUpdate: handleRoleUpdate }) })
                ] }, u.id);
              }) })
            ] }),
            filtered.length > 0 && /* @__PURE__ */ jsxs("div", { className: "border-t border-border bg-rail px-4 py-2 text-xs text-muted-foreground", children: [
              "Showing ",
              filtered.length,
              " of ",
              users.length,
              " users"
            ] })
          ] })
        ] })
      ] }) : (
        /* Keygen tab content */
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-12 gap-6 items-start", children: [
          /* @__PURE__ */ jsxs("div", { className: "md:col-span-5 bg-panel border border-border rounded-lg p-5 space-y-4 font-mono text-[11px]", children: [
            /* @__PURE__ */ jsxs("div", { className: "border-b border-border/40 pb-2 flex items-center gap-1.5 text-foreground", children: [
              /* @__PURE__ */ jsx(Key, { className: "h-4 w-4 text-racing-red animate-pulse" }),
              /* @__PURE__ */ jsx("h2", { className: "text-xs uppercase tracking-wider font-semibold", children: "Generate License Key" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsx("label", { className: "text-muted-foreground uppercase tracking-wider block", children: "Target HWID (16-char Hex)" }),
              /* @__PURE__ */ jsx("input", { type: "text", maxLength: 16, value: targetHwid, onChange: (e) => setTargetHwid(e.target.value.toUpperCase().replace(/[^0-9A-F]/i, "")), placeholder: "B3F2A79C4E0B615F", className: "w-full h-8 rounded border border-border bg-background px-3 font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-racing-red text-xs uppercase" }),
              /* @__PURE__ */ jsxs("p", { className: "text-[9px] text-muted-foreground leading-normal uppercase", children: [
                "Paste the 16-character Hardware ID found in the user's Settings ",
                "->",
                " License panel."
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsx("label", { className: "text-muted-foreground uppercase tracking-wider block", children: "License Tier" }),
              /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
                /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 cursor-pointer text-foreground", children: [
                  /* @__PURE__ */ jsx("input", { type: "radio", checked: selectedTier === "plus", onChange: () => setSelectedTier("plus"), className: "cursor-pointer accent-racing-red" }),
                  /* @__PURE__ */ jsx("span", { children: "PLUS WORKBOOK" })
                ] }),
                /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 cursor-pointer text-foreground", children: [
                  /* @__PURE__ */ jsx("input", { type: "radio", checked: selectedTier === "pro", onChange: () => setSelectedTier("pro"), className: "cursor-pointer accent-racing-red" }),
                  /* @__PURE__ */ jsx("span", { children: "PRO REAL-TIME" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsx("label", { className: "text-muted-foreground uppercase tracking-wider block", children: "Duration / Expiration" }),
              /* @__PURE__ */ jsxs("select", { value: expiryPreset, onChange: (e) => setExpiryPreset(e.target.value), className: "w-full h-8 rounded border border-border bg-background px-2 text-foreground focus:outline-none focus:border-racing-red cursor-pointer", children: [
                /* @__PURE__ */ jsx("option", { value: "never", children: "Lifetime (No Expiration)" }),
                /* @__PURE__ */ jsx("option", { value: "30", children: "30 Days (Demo/Trial)" }),
                /* @__PURE__ */ jsx("option", { value: "365", children: "1 Year (Annual)" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("button", { type: "button", onClick: handleGenerateKey, disabled: !targetHwid || targetHwid.length !== 16, className: "w-full flex items-center justify-center gap-2 h-9 rounded bg-racing-red hover:bg-red-600 px-4 font-semibold text-foreground uppercase tracking-wider transition-all duration-300 disabled:opacity-40 disabled:pointer-events-none cursor-pointer mt-4", children: [
              /* @__PURE__ */ jsx(Activity, { className: "h-4 w-4" }),
              "Generate License Key"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "md:col-span-7 bg-panel border border-border rounded-lg p-5 space-y-4 font-mono text-[11px]", children: [
            /* @__PURE__ */ jsx("div", { className: "border-b border-border/40 pb-2 text-foreground", children: /* @__PURE__ */ jsx("h2", { className: "text-xs uppercase tracking-wider font-semibold", children: "Signed Key Output" }) }),
            generatedKey ? /* @__PURE__ */ jsxs("div", { className: "space-y-4 animate-in fade-in slide-in-from-top-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsx("label", { className: "text-muted-foreground uppercase tracking-wider block", children: "Generated Cryptographic Payload" }),
                /* @__PURE__ */ jsx("textarea", { readOnly: true, rows: 5, value: generatedKey, className: "w-full rounded border border-border bg-background p-3 text-emerald-400 select-all font-mono text-[10px] leading-relaxed break-all focus:outline-none" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
                /* @__PURE__ */ jsx("button", { type: "button", onClick: copyKeyToClipboard, className: "flex-1 flex items-center justify-center gap-1.5 h-8 rounded border border-border hover:bg-accent text-foreground font-semibold uppercase tracking-wider transition-all cursor-pointer", children: copiedKey ? /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(Check, { className: "h-3.5 w-3.5 text-emerald-400" }),
                  "Copied"
                ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(Copy, { className: "h-3.5 w-3.5" }),
                  "Copy to Clipboard"
                ] }) }),
                /* @__PURE__ */ jsxs("button", { type: "button", onClick: handlePushToLocalBridge, disabled: pushingToBridge, className: "flex-1 flex items-center justify-center gap-1.5 h-8 rounded bg-primary hover:opacity-90 text-primary-foreground font-semibold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50", children: [
                  /* @__PURE__ */ jsx(RefreshCw, { className: `h-3.5 w-3.5 ${pushingToBridge ? "animate-spin" : ""}` }),
                  "One-Click Local Deploy"
                ] })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-[9px] text-muted-foreground leading-normal uppercase", children: 'Copy the payload above and send it to the client PC. Alternatively, if your local bridge is running locally on this PC on port 3001, click "One-Click Local Deploy" to instantly activate it!' })
            ] }) : /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-16 text-muted-foreground border border-dashed border-border/60 rounded-md", children: [
              /* @__PURE__ */ jsx(Lock, { className: "h-8 w-8 text-zinc-800 mb-2 animate-bounce" }),
              /* @__PURE__ */ jsx("span", { className: "text-[10px] uppercase tracking-wider", children: "Awaiting license generation configuration..." })
            ] })
          ] })
        ] })
      )
    ] })
  ] });
}
export {
  AdminPage as component
};

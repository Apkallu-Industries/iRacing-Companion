import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useLocation, useParams, Link, useNavigate } from "@tanstack/react-router";
import { X, Download, Trash2, Palette, Upload, Loader2, Share2, RotateCcw, Laptop, Cpu, Server, RefreshCw, Database, CheckCircle2, AlertCircle, Speaker, Volume2, Mic, Radio, ChevronRight, ChevronDown, Monitor, Wifi, Activity, Brain, ExternalLink, PlayCircle, Users, Settings, LogOut } from "lucide-react";
import { j as cn, B as Button, D as DARK_THEME, M as useTheme, J as useAuth, e as Tabs, g as TabsList, h as TabsTrigger, f as TabsContent, L as LAYOUT_PROFILES, P as PRESETS, T as THEME_GROUPS, I as Input, u as migrateThemeFile, d as THEME_SCHEMA_VERSION, i as buildThemeFile, N as useWorkbench, E as testLLMConnection, r as getDbConfig, F as testLocalDbConnection, z as saveDbConfig, K as useTelemetry } from "./router-BaRGcILm.js";
import * as React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { z } from "zod";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cva } from "class-variance-authority";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { b as createServerFn, e as createSsrRpc } from "./tanstack-Jo4b3tUQ.js";
import { r as requireSupabaseAuth } from "./auth-middleware-xZM3BZWQ.js";
import { toast } from "sonner";
import { s as speakText } from "./tts.functions-C1mSSPGY.js";
import { B as BackButton } from "./BackButton-D1X33uYM.js";
import { a as useRuntimeStatus } from "./useRuntimeStatus-RFAV9_LD.js";
const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetPortal = DialogPrimitive.Portal;
const SheetOverlay = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Overlay,
  {
    className: cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props,
    ref
  }
));
SheetOverlay.displayName = DialogPrimitive.Overlay.displayName;
const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom: "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right: "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm"
      }
    },
    defaultVariants: {
      side: "right"
    }
  }
);
const SheetContent = React.forwardRef(({ side = "right", className, children, ...props }, ref) => /* @__PURE__ */ jsxs(SheetPortal, { children: [
  /* @__PURE__ */ jsx(SheetOverlay, {}),
  /* @__PURE__ */ jsxs(DialogPrimitive.Content, { ref, className: cn(sheetVariants({ side }), className), ...props, children: [
    /* @__PURE__ */ jsxs(DialogPrimitive.Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary", children: [
      /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }),
      /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Close" })
    ] }),
    children
  ] })
] }));
SheetContent.displayName = DialogPrimitive.Content.displayName;
const SheetHeader = ({ className, ...props }) => /* @__PURE__ */ jsx("div", { className: cn("flex flex-col space-y-2 text-center sm:text-left", className), ...props });
SheetHeader.displayName = "SheetHeader";
const SheetTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Title,
  {
    ref,
    className: cn("text-lg font-semibold text-foreground", className),
    ...props
  }
));
SheetTitle.displayName = DialogPrimitive.Title.displayName;
const SheetDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Description,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
SheetDescription.displayName = DialogPrimitive.Description.displayName;
const ScrollArea = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  ScrollAreaPrimitive.Root,
  {
    ref,
    className: cn("relative overflow-hidden", className),
    ...props,
    children: [
      /* @__PURE__ */ jsx(ScrollAreaPrimitive.Viewport, { className: "h-full w-full rounded-[inherit]", children }),
      /* @__PURE__ */ jsx(ScrollBar, {}),
      /* @__PURE__ */ jsx(ScrollAreaPrimitive.Corner, {})
    ]
  }
));
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;
const ScrollBar = React.forwardRef(({ className, orientation = "vertical", ...props }, ref) => /* @__PURE__ */ jsx(
  ScrollAreaPrimitive.ScrollAreaScrollbar,
  {
    ref,
    orientation,
    className: cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsx(ScrollAreaPrimitive.ScrollAreaThumb, { className: "relative flex-1 rounded-full bg-border" })
  }
));
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;
const Textarea = React.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "textarea",
      {
        className: cn(
          "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Textarea.displayName = "Textarea";
const SWATCH_KEYS = [
  { key: "background", label: "BG" },
  { key: "panel", label: "Pn" },
  { key: "primary", label: "Pr" },
  { key: "foreground", label: "Fg" },
  { key: "ch-speed", label: "Sp" },
  { key: "ch-throttle", label: "Th" },
  { key: "ch-brake", label: "Br" },
  { key: "ch-rpm", label: "Rp" }
];
function ThemeCard({
  card,
  onApply,
  onDelete
}) {
  const get = (k) => card.theme[k] ?? DARK_THEME[k];
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "rounded-sm border border-border p-2",
      style: { background: get("panel"), color: get("foreground") },
      children: [
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: "mb-2 rounded-sm p-2",
            style: { background: get("background"), border: `1px solid ${get("border")}` },
            children: [
              /* @__PURE__ */ jsx("div", { className: "mb-1.5 text-[11px] font-medium truncate", children: card.name }),
              card.description && /* @__PURE__ */ jsx(
                "div",
                {
                  className: "mb-2 text-[10px] opacity-70 line-clamp-2",
                  style: { color: get("muted-foreground") },
                  children: card.description
                }
              ),
              /* @__PURE__ */ jsx("div", { className: "grid grid-cols-8 gap-0.5", children: SWATCH_KEYS.map((s) => /* @__PURE__ */ jsx(
                "div",
                {
                  title: `${s.label} ${get(s.key)}`,
                  className: "aspect-square rounded-[2px] border",
                  style: { background: get(s.key), borderColor: get("border") }
                },
                s.key
              )) })
            ]
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxs(
            Button,
            {
              size: "sm",
              className: "h-6 flex-1 gap-1 text-[10px]",
              onClick: () => onApply(card.theme),
              children: [
                /* @__PURE__ */ jsx(Download, { className: "h-3 w-3" }),
                "Install"
              ]
            }
          ),
          onDelete && /* @__PURE__ */ jsx(
            Button,
            {
              size: "sm",
              variant: "outline",
              className: "h-6 px-1.5",
              onClick: onDelete,
              title: "Delete",
              children: /* @__PURE__ */ jsx(Trash2, { className: "h-3 w-3" })
            }
          )
        ] })
      ]
    }
  );
}
const listSharedThemes = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("0bf9149e7d3d3f432048904f8dc8012a28053653a146e63cedd7525167633e7c"));
const publishTheme = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(z.object({
  name: z.string().min(1).max(60),
  description: z.string().max(280).optional().nullable(),
  theme: z.record(z.string(), z.string())
}).parse).handler(createSsrRpc("fe7b7e8995170e4c9364af2abb9483c2bbf388aa4d14f84d0b0bd4726603076d"));
const deleteSharedTheme = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(z.object({
  id: z.string().uuid()
}).parse).handler(createSsrRpc("496bb534cc3f11ad626ccae3a00bab7fc06e1efaf76e505a293d9a9366ef0fd3"));
const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const TOKEN_KEYS = Object.keys(DARK_THEME);
const themeTokensSchema = z.object(
  Object.fromEntries(
    TOKEN_KEYS.map((k) => [
      k,
      z.string({ message: `"${k}" must be a string` }).regex(HEX_RE, `"${k}" must be a hex color like #rrggbb`)
    ])
  )
).strict();
const themeFileSchema = z.union([
  z.object({
    $schema: z.string().optional(),
    name: z.string().max(60).optional(),
    description: z.string().max(280).nullable().optional(),
    theme: themeTokensSchema
  }).passthrough(),
  themeTokensSchema
]);
function ThemeEditor() {
  const { theme, setToken, setTheme, reset, layout, setLayout } = useTheme();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("editor");
  const [gallery, setGallery] = useState([]);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [shareName, setShareName] = useState("");
  const [shareDesc, setShareDesc] = useState("");
  const [publishing, setPublishing] = useState(false);
  const fileRef = useRef(null);
  const value = (k) => theme[k] ?? DARK_THEME[k];
  const loadGallery = async () => {
    setLoadingGallery(true);
    try {
      const res = await listSharedThemes();
      setGallery(
        (res.themes ?? []).map((t) => ({
          ...t,
          theme: t.theme
        }))
      );
    } catch {
      toast.error("Failed to load themes");
    } finally {
      setLoadingGallery(false);
    }
  };
  useEffect(() => {
    if (open && tab === "gallery") loadGallery();
  }, [open, tab]);
  const exportTheme = () => {
    const merged = { ...DARK_THEME, ...theme };
    const payload = buildThemeFile({
      name: shareName || "My Theme",
      description: shareDesc || null,
      theme: merged
    });
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(shareName || "pitwall-theme").replace(/\s+/g, "-").toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1e3);
  };
  const importTheme = async (file) => {
    if (file.size > 64 * 1024) {
      toast.error("Theme file too large", { description: "Max 64 KB." });
      return;
    }
    let raw;
    try {
      raw = await file.text();
    } catch {
      toast.error("Could not read file");
      return;
    }
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      toast.error("Invalid JSON", {
        description: e?.message ?? "File is not valid JSON."
      });
      return;
    }
    let migrated;
    try {
      migrated = migrateThemeFile(parsed);
    } catch (e) {
      toast.error("Unsupported theme file", {
        description: e?.message ?? "Could not read schema version."
      });
      return;
    }
    const migratedPayload = {
      ...migrated.file,
      version: migrated.toVersion,
      theme: migrated.file.theme
    };
    const candidate = migrated.file.theme;
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
      toast.error("Invalid theme file", {
        description: 'Expected an object with a "theme" map of color tokens.'
      });
      return;
    }
    const present = new Set(Object.keys(candidate));
    const missing = TOKEN_KEYS.filter((k) => !present.has(k));
    const unknown = [...present].filter((k) => !TOKEN_KEYS.includes(k));
    if (missing.length) {
      toast.error(`Missing ${missing.length} token${missing.length === 1 ? "" : "s"}`, {
        description: `Required: ${missing.slice(0, 6).join(", ")}${missing.length > 6 ? "…" : ""}`
      });
      return;
    }
    if (unknown.length) {
      toast.error(`Unknown token${unknown.length === 1 ? "" : "s"}`, {
        description: `Remove: ${unknown.slice(0, 6).join(", ")}${unknown.length > 6 ? "…" : ""}`
      });
      return;
    }
    const result = themeFileSchema.safeParse(migratedPayload);
    if (!result.success) {
      const first = result.error.issues[0];
      const path = first.path.join(".") || "root";
      toast.error("Theme validation failed", {
        description: `${path}: ${first.message}`
      });
      return;
    }
    const data = result.data;
    const tokens = "theme" in data ? data.theme : data;
    const name = "theme" in data ? data.name : void 0;
    setTheme({ ...DARK_THEME, ...tokens });
    if (name) setShareName(name);
    const wasMigrated = migrated.fromVersion < migrated.toVersion;
    toast.success(wasMigrated ? "Theme imported & migrated" : "Theme imported", {
      description: wasMigrated ? `Upgraded v${migrated.fromVersion} → v${migrated.toVersion}. ${TOKEN_KEYS.length} tokens applied.` : `Schema v${THEME_SCHEMA_VERSION}. ${TOKEN_KEYS.length} tokens applied.`
    });
  };
  const handlePublish = async () => {
    if (!user) {
      toast.error("Sign in to share a theme");
      return;
    }
    if (!shareName.trim()) {
      toast.error("Give your theme a name");
      return;
    }
    setPublishing(true);
    try {
      const merged = { ...DARK_THEME, ...theme };
      const res = await publishTheme({
        data: {
          name: shareName.trim(),
          description: shareDesc.trim() || null,
          theme: merged
        }
      });
      if (!res.ok) throw new Error(res.error);
      toast.success("Theme published");
      setShareDesc("");
      if (tab === "gallery") loadGallery();
    } catch (e) {
      toast.error(e?.message ?? "Failed to publish");
    } finally {
      setPublishing(false);
    }
  };
  const handleDelete = async (id) => {
    try {
      const res = await deleteSharedTheme({ data: { id } });
      if (!res.ok) throw new Error(res.error);
      setGallery((g) => g.filter((t) => t.id !== id));
    } catch (e) {
      toast.error(e?.message ?? "Failed to delete");
    }
  };
  return /* @__PURE__ */ jsxs(Sheet, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsx(SheetTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(
      "button",
      {
        className: "flex items-center gap-1.5 rounded-sm px-2 py-1 hover:bg-accent hover:text-foreground",
        title: "Customize theme",
        children: [
          /* @__PURE__ */ jsx(Palette, { className: "h-3.5 w-3.5" }),
          "Theme"
        ]
      }
    ) }),
    /* @__PURE__ */ jsxs(SheetContent, { side: "right", className: "w-[380px] sm:w-[440px] flex flex-col p-0", children: [
      /* @__PURE__ */ jsxs(SheetHeader, { className: "px-4 pt-4", children: [
        /* @__PURE__ */ jsx(SheetTitle, { className: "font-mono text-sm tracking-wider", children: "THEME EDITOR" }),
        /* @__PURE__ */ jsx(SheetDescription, { className: "text-xs", children: "Tune colors, import/export JSON, or share your theme with others." })
      ] }),
      /* @__PURE__ */ jsxs(Tabs, { value: tab, onValueChange: setTab, className: "flex flex-1 flex-col overflow-hidden", children: [
        /* @__PURE__ */ jsxs(TabsList, { className: "mx-4 mt-3 grid grid-cols-3", children: [
          /* @__PURE__ */ jsx(TabsTrigger, { value: "editor", className: "text-xs", children: "Editor" }),
          /* @__PURE__ */ jsx(TabsTrigger, { value: "share", className: "text-xs", children: "Share" }),
          /* @__PURE__ */ jsx(TabsTrigger, { value: "gallery", className: "text-xs", children: "Gallery" })
        ] }),
        /* @__PURE__ */ jsxs(TabsContent, { value: "editor", className: "mt-0 flex flex-1 flex-col overflow-hidden", children: [
          /* @__PURE__ */ jsxs("div", { className: "px-4 pt-3", children: [
            /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-wider text-muted-foreground", children: "UI Style" }),
            /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-2 mb-4", children: LAYOUT_PROFILES.map((p) => {
              const active = layout === p.id;
              const matchingPreset = PRESETS.find((pr) => pr.id === p.id);
              return /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => {
                    setLayout(p.id);
                    if (matchingPreset) setTheme(matchingPreset.theme);
                  },
                  className: `relative flex items-center gap-3 text-left rounded-sm border px-3 py-2.5 text-xs transition-all ${active ? "border-primary bg-primary/10 ring-1 ring-primary/30" : "border-border bg-panel-2 hover:border-primary/50"}`,
                  children: [
                    /* @__PURE__ */ jsx("span", { className: "flex h-8 w-8 flex-shrink-0 flex-wrap overflow-hidden rounded-sm border border-border", children: p.swatches.map((c, i) => /* @__PURE__ */ jsx(
                      "span",
                      {
                        className: "block",
                        style: {
                          background: c,
                          width: "50%",
                          height: "50%"
                        }
                      },
                      i
                    )) }),
                    /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                      /* @__PURE__ */ jsx("div", { className: "font-mono font-bold text-[11px] leading-tight truncate", children: p.label }),
                      /* @__PURE__ */ jsx("div", { className: "text-[9px] text-muted-foreground mt-0.5 leading-tight", children: p.subtitle })
                    ] }),
                    active && /* @__PURE__ */ jsx("span", { className: "text-[8px] font-bold text-primary uppercase tracking-widest flex-shrink-0", children: "Active" })
                  ]
                },
                p.id
              );
            }) })
          ] }),
          /* @__PURE__ */ jsx(ScrollArea, { className: "mt-2 flex-1 px-4", children: /* @__PURE__ */ jsx("div", { className: "space-y-4 pb-6", children: THEME_GROUPS.map((group) => /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "mb-1.5 text-[10px] uppercase tracking-wider text-muted-foreground", children: group.label }),
            /* @__PURE__ */ jsx("div", { className: "space-y-1", children: group.tokens.map((t) => /* @__PURE__ */ jsxs(
              "label",
              {
                className: "flex items-center justify-between gap-2 rounded-sm px-1 py-1 text-xs hover:bg-accent/40",
                children: [
                  /* @__PURE__ */ jsx("span", { children: t.label }),
                  /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "color",
                        value: value(t.key),
                        onChange: (e) => setToken(t.key, e.target.value),
                        className: "h-6 w-8 cursor-pointer rounded-sm border border-border bg-transparent"
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "text",
                        value: value(t.key),
                        onChange: (e) => setToken(t.key, e.target.value),
                        className: "w-20 rounded-sm border border-border bg-panel-2 px-1.5 py-0.5 font-mono text-[10px]"
                      }
                    )
                  ] })
                ]
              },
              t.key
            )) })
          ] }, group.label)) }) })
        ] }),
        /* @__PURE__ */ jsx(TabsContent, { value: "share", className: "mt-0 flex flex-1 flex-col overflow-hidden", children: /* @__PURE__ */ jsx(ScrollArea, { className: "flex-1 px-4 pt-3", children: /* @__PURE__ */ jsxs("div", { className: "space-y-4 pb-6", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-wider text-muted-foreground", children: "Import / Export" }),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsxs(
                Button,
                {
                  size: "sm",
                  variant: "outline",
                  className: "flex-1 gap-1.5",
                  onClick: () => fileRef.current?.click(),
                  children: [
                    /* @__PURE__ */ jsx(Upload, { className: "h-3.5 w-3.5" }),
                    " Import JSON"
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                Button,
                {
                  size: "sm",
                  variant: "outline",
                  className: "flex-1 gap-1.5",
                  onClick: exportTheme,
                  children: [
                    /* @__PURE__ */ jsx(Download, { className: "h-3.5 w-3.5" }),
                    " Export JSON"
                  ]
                }
              ),
              /* @__PURE__ */ jsx(
                "input",
                {
                  ref: fileRef,
                  type: "file",
                  accept: "application/json,.json",
                  className: "hidden",
                  onChange: (e) => {
                    const f = e.target.files?.[0];
                    if (f) importTheme(f);
                    e.target.value = "";
                  }
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-wider text-muted-foreground", children: "Publish to gallery" }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(
                Input,
                {
                  placeholder: "Theme name",
                  value: shareName,
                  onChange: (e) => setShareName(e.target.value),
                  className: "h-8 text-xs",
                  maxLength: 60
                }
              ),
              /* @__PURE__ */ jsx(
                Textarea,
                {
                  placeholder: "Short description (optional)",
                  value: shareDesc,
                  onChange: (e) => setShareDesc(e.target.value),
                  className: "min-h-16 text-xs",
                  maxLength: 280
                }
              ),
              /* @__PURE__ */ jsxs(
                Button,
                {
                  size: "sm",
                  onClick: handlePublish,
                  disabled: publishing,
                  className: "w-full gap-1.5",
                  children: [
                    publishing ? /* @__PURE__ */ jsx(Loader2, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ jsx(Share2, { className: "h-3.5 w-3.5" }),
                    "Publish current theme"
                  ]
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-wider text-muted-foreground", children: "Preview card" }),
            /* @__PURE__ */ jsx(
              ThemeCard,
              {
                card: {
                  name: shareName || "My Theme",
                  description: shareDesc || null,
                  theme: { ...DARK_THEME, ...theme }
                },
                onApply: () => toast.message("That's already your current theme")
              }
            )
          ] })
        ] }) }) }),
        /* @__PURE__ */ jsx(TabsContent, { value: "gallery", className: "mt-0 flex flex-1 flex-col overflow-hidden", children: /* @__PURE__ */ jsx(ScrollArea, { className: "flex-1 px-4 pt-3", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2 pb-6", children: [
          loadingGallery && /* @__PURE__ */ jsxs("div", { className: "col-span-2 flex items-center justify-center py-8 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
            " Loading…"
          ] }),
          !loadingGallery && gallery.length === 0 && /* @__PURE__ */ jsx("div", { className: "col-span-2 py-8 text-center text-xs text-muted-foreground", children: "No shared themes yet. Be the first to publish one." }),
          gallery.map((t) => {
            const card = {
              id: t.id,
              name: t.name,
              description: t.description,
              theme: t.theme
            };
            return /* @__PURE__ */ jsx(
              ThemeCard,
              {
                card,
                onApply: (th) => {
                  setTheme({ ...DARK_THEME, ...th });
                  toast.success(`Installed "${t.name}"`);
                },
                onDelete: user?.id === t.user_id ? () => handleDelete(t.id) : void 0
              },
              t.id
            );
          })
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "hairline-t flex items-center justify-between gap-2 px-4 py-3", children: [
        /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", onClick: reset, className: "gap-1.5", children: [
          /* @__PURE__ */ jsx(RotateCcw, { className: "h-3.5 w-3.5" }),
          "Reset"
        ] }),
        /* @__PURE__ */ jsx(Button, { size: "sm", onClick: () => setOpen(false), children: "Done" })
      ] })
    ] })
  ] });
}
const PROVIDERS = [
  {
    id: "lmstudio",
    name: "LM Studio",
    icon: Laptop,
    url: "http://localhost:1234/v1",
    desc: "lmstudio-native."
  },
  {
    id: "ollama",
    name: "Ollama",
    icon: Cpu,
    url: "http://localhost:11434/v1",
    desc: "Local inference via Ollama."
  },
  {
    id: "huggingface",
    name: "HuggingFace TGI",
    icon: Server,
    url: "http://localhost:8080/v1",
    desc: "Local TGI container backend."
  },
  {
    id: "lemonade",
    name: "LlamaEdge / Lemonade",
    icon: Laptop,
    url: "http://localhost:8080/v1",
    desc: "Wasm edge inference."
  }
];
function LLMSettings({ inline }) {
  const {
    llmProvider,
    llmBaseUrl,
    llmModelId,
    llmApiKey,
    setLlmProvider,
    setLlmBaseUrl,
    setLlmModelId,
    setLlmApiKey
  } = useWorkbench();
  const [open, setOpen] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const activeProviderInfo = PROVIDERS.find((p) => p.id === llmProvider);
  const applyDefaults = (providerId) => {
    const p = PROVIDERS.find((x) => x.id === providerId);
    if (!p) return;
    setLlmProvider(p.id);
    if (p.url) setLlmBaseUrl(p.url);
    setLlmApiKey("");
    setTestResult(null);
  };
  const runTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await testLLMConnection(
        llmBaseUrl || activeProviderInfo?.url || "",
        llmModelId,
        llmApiKey
      );
      setTestResult(res);
    } catch (e) {
      setTestResult({
        success: false,
        message: e instanceof Error ? e.message : "An unexpected error occurred."
      });
    } finally {
      setTesting(false);
    }
  };
  const inlineForm = /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-wider text-muted-foreground", children: "AI Provider" }),
      /* @__PURE__ */ jsx("div", { className: "grid gap-2 grid-cols-1 sm:grid-cols-2", children: PROVIDERS.map((p) => /* @__PURE__ */ jsxs(
        "label",
        {
          className: `flex cursor-pointer items-start gap-2.5 rounded-lg border p-2.5 hover:bg-accent/40 transition-colors ${llmProvider === p.id ? "border-primary bg-primary/5" : "border-border bg-panel"}`,
          children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "radio",
                name: "inlineLlmProvider",
                checked: llmProvider === p.id,
                onChange: () => applyDefaults(p.id),
                className: "mt-1 shrink-0 cursor-pointer"
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxs("div", { className: "text-xs font-medium flex items-center gap-1.5 text-foreground", children: [
                /* @__PURE__ */ jsx(p.icon, { className: "h-3.5 w-3.5 shrink-0 text-primary" }),
                p.name
              ] }),
              /* @__PURE__ */ jsx("div", { className: "text-[10px] text-muted-foreground mt-0.5 leading-snug line-clamp-2", children: p.desc })
            ] })
          ]
        },
        p.id
      )) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-4 border-t border-border/40 pt-4 animate-in fade-in slide-in-from-top-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx("label", { className: "text-[10px] uppercase tracking-wider text-muted-foreground block", children: "Base URL (OpenAI Compatible)" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              type: "text",
              value: llmBaseUrl,
              onChange: (e) => {
                setLlmBaseUrl(e.target.value);
                setTestResult(null);
              },
              placeholder: activeProviderInfo?.url || "http://localhost:1234/v1",
              className: "font-mono text-xs bg-background/50 border-border/80 focus:border-primary/50"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx("label", { className: "text-[10px] uppercase tracking-wider text-muted-foreground block", children: "Model ID" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              type: "text",
              value: llmModelId,
              onChange: (e) => {
                setLlmModelId(e.target.value);
                setTestResult(null);
              },
              placeholder: "e.g. liquid/lfm2.5-1.2b",
              className: "font-mono text-xs bg-background/50 border-border/80 focus:border-primary/50"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsx("label", { className: "text-[10px] uppercase tracking-wider text-muted-foreground block", children: "API Token / Permission Key (Optional)" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            type: "password",
            value: llmApiKey,
            onChange: (e) => {
              setLlmApiKey(e.target.value);
              setTestResult(null);
            },
            placeholder: "Enter LM Studio token or Bearer key if required",
            className: "font-mono text-xs bg-background/50 border-border/80 focus:border-primary/50"
          }
        ),
        /* @__PURE__ */ jsx("p", { className: "text-[9px] text-muted-foreground mt-1", children: "Required if your local server uses token authentication (e.g. LM Studio 0.4.0+)." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "pt-2", children: [
        /* @__PURE__ */ jsxs(
          Button,
          {
            type: "button",
            variant: "secondary",
            size: "sm",
            onClick: runTest,
            disabled: testing,
            className: "w-full font-mono text-[10px] uppercase tracking-wider gap-1.5 h-8 cursor-pointer",
            children: [
              testing ? /* @__PURE__ */ jsx(Loader2, { className: "h-3 w-3 animate-spin" }) : /* @__PURE__ */ jsx(RefreshCw, { className: "h-3 w-3" }),
              testing ? "Testing Connection..." : "Test Local Host Software Connection"
            ]
          }
        ),
        testResult && /* @__PURE__ */ jsxs(
          "div",
          {
            className: `mt-3 rounded-lg p-3 border text-xs whitespace-pre-line leading-relaxed font-mono ${testResult.success ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400" : "border-rose-500/30 bg-rose-500/5 text-rose-400"}`,
            children: [
              /* @__PURE__ */ jsx("div", { className: "font-semibold uppercase tracking-wider text-[10px] mb-1 font-mono", children: testResult.success ? "✓ AI Connection Successful" : "✗ Connection Failed" }),
              /* @__PURE__ */ jsx("div", { className: "text-[10px]", children: testResult.message })
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between gap-2 pt-2 border-t border-border/40", children: /* @__PURE__ */ jsxs(
      Button,
      {
        type: "button",
        variant: "outline",
        size: "sm",
        onClick: () => applyDefaults("lmstudio"),
        className: "font-mono text-[10px] uppercase tracking-wider gap-1.5 h-8 cursor-pointer",
        children: [
          /* @__PURE__ */ jsx(RotateCcw, { className: "h-3.5 w-3.5" }),
          "Reset Defaults"
        ]
      }
    ) })
  ] });
  if (inline) {
    return inlineForm;
  }
  return /* @__PURE__ */ jsxs(Sheet, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsx(SheetTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(
      "button",
      {
        className: "flex items-center gap-1.5 rounded-sm px-2 py-1 hover:bg-accent hover:text-foreground",
        title: "Configure AI Engine",
        children: [
          /* @__PURE__ */ jsx(Cpu, { className: "h-3.5 w-3.5" }),
          "AI Engine"
        ]
      }
    ) }),
    /* @__PURE__ */ jsxs(
      SheetContent,
      {
        side: "right",
        className: "w-[380px] sm:w-[440px] flex flex-col p-0 bg-background text-foreground border-l border-border/60",
        children: [
          /* @__PURE__ */ jsxs(SheetHeader, { className: "px-4 pt-4", children: [
            /* @__PURE__ */ jsx(SheetTitle, { className: "font-mono text-sm tracking-wider", children: "AI ENGINE CONFIGURATION" }),
            /* @__PURE__ */ jsx(SheetDescription, { className: "text-xs", children: "Choose where rendering and AI analysis compute takes place." })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-y-auto px-4 py-4 space-y-6", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-wider text-muted-foreground", children: "Provider" }),
              /* @__PURE__ */ jsx("div", { className: "space-y-2", children: PROVIDERS.map((p) => /* @__PURE__ */ jsxs(
                "label",
                {
                  className: `flex cursor-pointer items-start gap-3 rounded-md border p-3 hover:bg-accent/40 ${llmProvider === p.id ? "border-primary bg-primary/5" : "border-border bg-panel-2"}`,
                  children: [
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "radio",
                        name: "llmProvider",
                        checked: llmProvider === p.id,
                        onChange: () => applyDefaults(p.id),
                        className: "mt-1 cursor-pointer"
                      }
                    ),
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsxs("div", { className: "text-sm font-medium flex items-center gap-2 text-foreground", children: [
                        /* @__PURE__ */ jsx(p.icon, { className: "h-4 w-4" }),
                        p.name
                      ] }),
                      /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground mt-0.5", children: p.desc })
                    ] })
                  ]
                },
                p.id
              )) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-4 animate-in fade-in slide-in-from-top-2", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block", children: "Base URL (OpenAI Compatible)" }),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    type: "text",
                    value: llmBaseUrl,
                    onChange: (e) => {
                      setLlmBaseUrl(e.target.value);
                      setTestResult(null);
                    },
                    placeholder: activeProviderInfo?.url || "http://localhost:1234/v1",
                    className: "font-mono text-xs"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block", children: "API Token / Permission Key (Optional)" }),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    type: "password",
                    value: llmApiKey,
                    onChange: (e) => {
                      setLlmApiKey(e.target.value);
                      setTestResult(null);
                    },
                    placeholder: "Enter LM Studio token or Bearer key if required",
                    className: "font-mono text-xs"
                  }
                ),
                /* @__PURE__ */ jsx("p", { className: "text-[9px] text-muted-foreground mt-1", children: "Required if your local server uses token authentication (e.g. LM Studio 0.4.0+)." })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block", children: "Model ID (e.g. liquid/lfm2.5-1.2b)" }),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    type: "text",
                    value: llmModelId,
                    onChange: (e) => {
                      setLlmModelId(e.target.value);
                      setTestResult(null);
                    },
                    placeholder: "e.g. liquid/lfm2.5-1.2b, llama-3-8b-instruct",
                    className: "font-mono text-xs"
                  }
                ),
                /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground mt-1.5", children: "The model must support tool-calling schemas to function properly as an Advisor." })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "pt-2", children: [
                /* @__PURE__ */ jsx(
                  Button,
                  {
                    type: "button",
                    variant: "secondary",
                    size: "sm",
                    onClick: runTest,
                    disabled: testing,
                    className: "w-full font-mono text-[10px] uppercase tracking-wider gap-1.5 h-8 cursor-pointer",
                    children: testing ? "Testing Connection..." : "Test Connection"
                  }
                ),
                testResult && /* @__PURE__ */ jsxs(
                  "div",
                  {
                    className: `mt-3 rounded-md p-3 border text-xs ${testResult.success ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400" : "border-rose-500/30 bg-rose-500/5 text-rose-400"}`,
                    children: [
                      /* @__PURE__ */ jsx("div", { className: "font-semibold uppercase tracking-wider text-[10px] mb-1 font-mono", children: testResult.success ? "✓ Connection OK" : "✗ Connection Failed" }),
                      /* @__PURE__ */ jsx("div", { className: "whitespace-pre-line leading-relaxed font-sans", children: testResult.message })
                    ]
                  }
                )
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "hairline-t flex items-center justify-between gap-2 px-4 py-3 bg-panel shrink-0 border-t border-border/60", children: [
            /* @__PURE__ */ jsxs(
              Button,
              {
                variant: "outline",
                size: "sm",
                onClick: () => applyDefaults("lmstudio"),
                className: "gap-1.5 cursor-pointer",
                children: [
                  /* @__PURE__ */ jsx(RotateCcw, { className: "h-3.5 w-3.5" }),
                  "Reset Defaults"
                ]
              }
            ),
            /* @__PURE__ */ jsx(Button, { size: "sm", onClick: () => setOpen(false), className: "cursor-pointer", children: "Done" })
          ] })
        ]
      }
    )
  ] });
}
function LocalDbSettings() {
  const [open, setOpen] = useState(false);
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState("unchecked");
  const [testResult, setTestResult] = useState(null);
  const [idbUsage, setIdbUsage] = useState("Calculating...");
  const [localUri, setLocalUri] = useState("mongodb://127.0.0.1:27017/");
  const [cloudUri, setCloudUri] = useState("");
  const [saving, setSaving] = useState(false);
  const loadDbSettings = async () => {
    try {
      const res = await getDbConfig();
      if (res.data) {
        setLocalUri(res.data.localUri || "mongodb://127.0.0.1:27017/");
        setCloudUri(res.data.cloudUri || "");
      }
    } catch (e) {
      console.error("Failed to load db config:", e);
    }
  };
  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      const res = await saveDbConfig({ data: { localUri, cloudUri } });
      if (res.success) {
        toast.success("Database settings saved successfully.");
        checkConnection();
      } else {
        toast.error(res.error?.message || "Failed to save configuration.");
      }
    } catch (e) {
      toast.error(e.message || "Error saving database configuration.");
    } finally {
      setSaving(false);
    }
  };
  const checkConnection = async () => {
    setTesting(true);
    setStatus("unchecked");
    try {
      const res = await testLocalDbConnection();
      setTestResult(res);
      setStatus(res.success ? "connected" : "failed");
    } catch (e) {
      setTestResult({
        success: false,
        message: `Connection failed: ${e.message || String(e)}`
      });
      setStatus("failed");
    } finally {
      setTesting(false);
    }
  };
  const checkIndexedDbSize = async () => {
    if (typeof navigator !== "undefined" && navigator.storage && navigator.storage.estimate) {
      try {
        const estimate = await navigator.storage.estimate();
        const used = estimate.usage ? (estimate.usage / (1024 * 1024)).toFixed(1) : "0";
        const total = estimate.quota ? (estimate.quota / (1024 * 1024 * 1024)).toFixed(1) : "unknown";
        setIdbUsage(`${used} MB used of ${total} GB quota`);
      } catch {
        setIdbUsage("Available");
      }
    } else {
      setIdbUsage("Supported");
    }
  };
  const clearIndexedDb = async () => {
    if (!confirm(
      "Are you sure you want to clear your local IndexedDB file cache? This will delete all downloaded telemetry files from this browser. Telemetry session records in MongoDB will remain."
    )) {
      return;
    }
    try {
      const req = indexedDB.deleteDatabase("apextrace_local_telemetry");
      req.onsuccess = () => {
        toast.success("Local IndexedDB file cache cleared successfully.");
        checkIndexedDbSize();
      };
      req.onerror = () => {
        toast.error("Failed to clear local file cache.");
      };
    } catch (err) {
      toast.error(err.message || "Error clearing cache");
    }
  };
  useEffect(() => {
    if (open) {
      loadDbSettings();
      checkConnection();
      checkIndexedDbSize();
    }
  }, [open]);
  return /* @__PURE__ */ jsxs(Sheet, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsx(SheetTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(
      "button",
      {
        className: "flex items-center gap-1.5 rounded-sm px-2 py-1 hover:bg-accent hover:text-foreground",
        title: "Configure Local Storage & Database",
        children: [
          /* @__PURE__ */ jsx(Database, { className: "h-3.5 w-3.5" }),
          "Database"
        ]
      }
    ) }),
    /* @__PURE__ */ jsxs(
      SheetContent,
      {
        side: "right",
        className: "w-[380px] sm:w-[440px] flex flex-col p-0 bg-background text-foreground border-l border-border",
        children: [
          /* @__PURE__ */ jsxs(SheetHeader, { className: "px-4 pt-4", children: [
            /* @__PURE__ */ jsxs(SheetTitle, { className: "font-mono text-sm tracking-wider flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(Database, { className: "h-4 w-4 text-primary" }),
              "LOCAL STORAGE & DATABASE"
            ] }),
            /* @__PURE__ */ jsx(SheetDescription, { className: "text-xs", children: "Configure and test your offline MongoDB database and local browser file storage." })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-y-auto px-4 py-4 space-y-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "hairline rounded-md bg-panel p-4 space-y-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-border/40 pb-2", children: [
                /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono uppercase tracking-wider text-muted-foreground", children: "MongoDB Status" }),
                testing ? /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 text-[10px] text-muted-foreground uppercase font-mono tracking-wider", children: [
                  /* @__PURE__ */ jsx(RefreshCw, { className: "h-3 w-3 animate-spin" }),
                  " Testing..."
                ] }) : status === "connected" ? /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 text-[10px] text-emerald-400 uppercase font-mono tracking-wider", children: [
                  /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3.5 w-3.5" }),
                  " Connected"
                ] }) : /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 text-[10px] text-rose-400 uppercase font-mono tracking-wider", children: [
                  /* @__PURE__ */ jsx(AlertCircle, { className: "h-3.5 w-3.5" }),
                  " Disconnected"
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-border/40 pb-2", children: [
                /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono uppercase tracking-wider text-muted-foreground", children: "IndexedDB File Cache" }),
                /* @__PURE__ */ jsx("span", { className: "text-xs font-mono text-primary font-medium", children: "Active" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono uppercase tracking-wider text-muted-foreground", children: "Local Cache Size" }),
                /* @__PURE__ */ jsx("span", { className: "text-xs font-mono text-muted-foreground", children: idbUsage })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-4 pt-2 border-t border-border/20", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-xs font-mono uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1", children: "Database URI Configuration" }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
                /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsx("label", { className: "text-[10px] uppercase tracking-wider text-muted-foreground block", children: "Local MongoDB URI" }),
                  /* @__PURE__ */ jsx(
                    Input,
                    {
                      type: "text",
                      value: localUri,
                      onChange: (e) => setLocalUri(e.target.value),
                      placeholder: "mongodb://127.0.0.1:27017/",
                      className: "font-mono text-xs"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsx("label", { className: "text-[10px] uppercase tracking-wider text-muted-foreground block", children: "Cloud MongoDB URI (Sync)" }),
                  /* @__PURE__ */ jsx(
                    Input,
                    {
                      type: "password",
                      value: cloudUri,
                      onChange: (e) => setCloudUri(e.target.value),
                      placeholder: "mongodb+srv://username:password@cluster0.abcde.mongodb.net/iracing",
                      className: "font-mono text-xs"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsx(
                  Button,
                  {
                    type: "button",
                    onClick: handleSaveConfig,
                    disabled: saving,
                    className: "w-full font-mono text-[10px] uppercase tracking-wider h-8",
                    children: saving ? "Saving Configuration..." : "Save Connection URIs"
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-xs font-mono uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1", children: "Setup Guide" }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-4 text-xs leading-relaxed text-muted-foreground", children: [
                /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ jsx("div", { className: "font-semibold text-foreground font-mono text-[11px]", children: "Step 1: Install & Run MongoDB" }),
                  /* @__PURE__ */ jsx("p", { children: "Pit Wall requires a running MongoDB server on your local machine to keep your lap records and session metadata." }),
                  /* @__PURE__ */ jsxs("div", { className: "flex gap-2 my-2 pt-1", children: [
                    /* @__PURE__ */ jsx(
                      "a",
                      {
                        href: "https://www.mongodb.com/try/download/community",
                        target: "_blank",
                        rel: "noopener noreferrer",
                        className: "flex-1",
                        children: /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", className: "w-full text-[10px] font-mono uppercase tracking-wider h-7", children: "Download Installer (.MSI)" })
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "a",
                      {
                        href: "https://www.mongodb.com/products/tools/compass",
                        target: "_blank",
                        rel: "noopener noreferrer",
                        className: "flex-1",
                        children: /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", className: "w-full text-[10px] font-mono uppercase tracking-wider h-7", children: "Download Compass GUI" })
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "mt-2 rounded bg-rail p-2.5 font-mono text-[10px] text-foreground border border-border/60 space-y-2 leading-normal", children: [
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "# Windows MSI Installation (Recommended):" }),
                      /* @__PURE__ */ jsxs("ul", { className: "list-disc list-inside text-muted-foreground mt-1 space-y-0.5 ml-1", children: [
                        /* @__PURE__ */ jsxs("li", { children: [
                          "Choose ",
                          /* @__PURE__ */ jsx("span", { className: "text-foreground", children: "Complete" }),
                          " setup type"
                        ] }),
                        /* @__PURE__ */ jsxs("li", { children: [
                          "Check ",
                          /* @__PURE__ */ jsx("span", { className: "text-foreground", children: '"Install MongoDB as a Service"' })
                        ] }),
                        /* @__PURE__ */ jsxs("li", { children: [
                          "Check ",
                          /* @__PURE__ */ jsx("span", { className: "text-foreground", children: '"Install MongoDB Compass"' })
                        ] })
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "border-t border-border/40 pt-2", children: [
                      /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "# Windows Command Line (winget)" }),
                      /* @__PURE__ */ jsx("br", {}),
                      "winget install MongoDB.Community.Server",
                      /* @__PURE__ */ jsx("br", {}),
                      /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "# If service is stopped, run as Admin:" }),
                      /* @__PURE__ */ jsx("br", {}),
                      "Start-Service -Name MongoDB"
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "border-t border-border/40 pt-2", children: [
                      /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "# Alternative (Docker Container)" }),
                      /* @__PURE__ */ jsx("br", {}),
                      "docker run -d -p 27017:27017 --name iracing-mongo mongo:latest"
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ jsx("div", { className: "font-semibold text-foreground font-mono text-[11px]", children: "Step 2: Connection Stability" }),
                  /* @__PURE__ */ jsxs("p", { children: [
                    "The application connects automatically to",
                    " ",
                    /* @__PURE__ */ jsx("code", { className: "font-mono bg-rail px-1 rounded text-primary", children: "mongodb://127.0.0.1:27017/" }),
                    ". Ensure this port is not blocked or occupied."
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ jsx("div", { className: "font-semibold text-foreground font-mono text-[11px]", children: "Step 3: Verification" }),
                  /* @__PURE__ */ jsx("p", { children: 'Click "Test Connection" below. This will ping the local MongoDB instance and initialize required schemas and indexes.' })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-3 pt-2", children: [
              /* @__PURE__ */ jsxs(
                Button,
                {
                  type: "button",
                  onClick: checkConnection,
                  disabled: testing,
                  className: "w-full font-mono text-[10px] uppercase tracking-wider gap-1.5",
                  children: [
                    /* @__PURE__ */ jsx(Server, { className: "h-3.5 w-3.5" }),
                    testing ? "Testing Local DB..." : "Test Database Connection"
                  ]
                }
              ),
              testResult && /* @__PURE__ */ jsxs(
                "div",
                {
                  className: `rounded-md p-3 border text-xs whitespace-pre-line leading-relaxed font-sans ${testResult.success ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400" : "border-rose-500/30 bg-rose-500/5 text-rose-400"}`,
                  children: [
                    /* @__PURE__ */ jsx("div", { className: "font-semibold uppercase tracking-wider text-[10px] mb-1 font-mono", children: testResult.success ? "✓ MongoDB connection OK" : "✗ MongoDB connection Failed" }),
                    /* @__PURE__ */ jsx("div", { className: "font-mono text-[11px]", children: testResult.message })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-3 pt-4 border-t border-border/40", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-xs font-mono uppercase tracking-wider text-muted-foreground", children: "Browser Cache Management" }),
              /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground leading-relaxed", children: [
                "Telemetry binary files (",
                /* @__PURE__ */ jsx("code", { className: "font-mono", children: ".ibt" }),
                " and",
                " ",
                /* @__PURE__ */ jsx("code", { className: "font-mono", children: ".pwlap" }),
                ") are saved in your browser's local cache. You can empty this cache to free up disk space."
              ] }),
              /* @__PURE__ */ jsxs(
                Button,
                {
                  type: "button",
                  variant: "destructive",
                  size: "sm",
                  onClick: clearIndexedDb,
                  className: "w-full font-mono text-[10px] uppercase tracking-wider gap-1.5",
                  children: [
                    /* @__PURE__ */ jsx(Trash2, { className: "h-3.5 w-3.5" }),
                    "Clear Browser File Cache"
                  ]
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "hairline-t flex items-center justify-end px-4 py-3 bg-panel-2", children: /* @__PURE__ */ jsx(Button, { size: "sm", onClick: () => setOpen(false), children: "Done" }) })
        ]
      }
    )
  ] });
}
const DEFAULT_VOICE_ID = "JBFqnCBsd6RMkjVDRZzb";
async function enumerateKind(kind) {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter((d) => d.kind === kind).map((d, i) => ({
      deviceId: d.deviceId,
      label: d.label || `${kind === "audioinput" ? "Microphone" : "Speaker"} ${i + 1}`
    }));
  } catch {
    return [];
  }
}
async function playAudioOnDevice(base64, mime, deviceId) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: mime });
  const blobUrl = URL.createObjectURL(blob);
  const audio = new Audio(blobUrl);
  if (deviceId && typeof audio.setSinkId === "function") {
    try {
      await audio.setSinkId(deviceId);
    } catch {
    }
  }
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      cleanup();
      URL.revokeObjectURL(blobUrl);
      reject(new Error("Audio loading timeout"));
    }, 5e3);
    const handleCanPlay = () => {
      clearTimeout(timeout);
      cleanup();
      audio.play().then(resolve).catch(reject);
    };
    const handleError = () => {
      clearTimeout(timeout);
      cleanup();
      URL.revokeObjectURL(blobUrl);
      reject(new Error("Failed to load audio: " + (audio.error?.message || "unknown error")));
    };
    const cleanup = () => {
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("canplaythrough", handleCanPlay);
    };
    audio.addEventListener("canplay", handleCanPlay, { once: true });
    audio.addEventListener("error", handleError, { once: true });
  });
}
function DeviceSelect({
  kind,
  value,
  onChange,
  label,
  hint,
  icon: Icon
}) {
  const [devices, setDevices] = useState([]);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const load = useCallback(async () => {
    if (kind === "audioinput") {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((t) => t.stop());
      } catch {
        setPermissionDenied(true);
        return;
      }
    }
    const list = await enumerateKind(kind);
    setDevices(list);
  }, [kind]);
  useEffect(() => {
    load();
    navigator.mediaDevices.addEventListener("devicechange", load);
    return () => navigator.mediaDevices.removeEventListener("devicechange", load);
  }, [load]);
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("label", { className: "text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5", children: [
      /* @__PURE__ */ jsx(Icon, { className: "h-3 w-3" }),
      label
    ] }),
    permissionDenied ? /* @__PURE__ */ jsxs("div", { className: "rounded border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-[10px] text-amber-400 font-mono flex items-center gap-1.5", children: [
      /* @__PURE__ */ jsx(AlertCircle, { className: "h-3.5 w-3.5 shrink-0" }),
      "Microphone permission denied. Allow access in browser settings."
    ] }) : devices.length === 0 ? /* @__PURE__ */ jsx("div", { className: "h-8 rounded border border-border/60 bg-background/50 px-3 flex items-center text-[10px] text-muted-foreground font-mono animate-pulse", children: "Scanning devices…" }) : /* @__PURE__ */ jsxs(
      "select",
      {
        value: value || "default",
        onChange: (e) => onChange(e.target.value === "default" ? "" : e.target.value),
        className: "w-full h-8 rounded border border-border/80 bg-background/50 px-2 text-[11px] font-mono text-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 cursor-pointer",
        children: [
          /* @__PURE__ */ jsx("option", { value: "default", children: "System Default" }),
          devices.map((d) => /* @__PURE__ */ jsx("option", { value: d.deviceId, children: d.label }, d.deviceId))
        ]
      }
    ),
    /* @__PURE__ */ jsx("p", { className: "mt-1 text-[10px] text-muted-foreground", children: hint })
  ] });
}
function MicLevelMeter({ deviceId }) {
  const [level, setLevel] = useState(0);
  const [active, setActive] = useState(false);
  const rafRef = useRef(0);
  const streamRef = useRef(null);
  const analyserRef = useRef(null);
  const start = async () => {
    try {
      const constraints = {
        audio: deviceId ? { deviceId: { exact: deviceId } } : true
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      const ctx = new AudioContext();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      src.connect(analyser);
      analyserRef.current = analyser;
      setActive(true);
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setLevel(Math.min(100, avg / 128 * 100));
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      toast.error("Could not access microphone.");
    }
  };
  const stop = () => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    analyserRef.current = null;
    setActive(false);
    setLevel(0);
  };
  useEffect(() => () => stop(), []);
  const bars = 20;
  return /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx("div", { className: "flex gap-0.5 flex-1 h-5 items-end", children: Array.from({ length: bars }).map((_, i) => {
        const threshold = i / bars * 100;
        const lit = level > threshold;
        const color = i < bars * 0.6 ? "bg-emerald-500" : i < bars * 0.85 ? "bg-yellow-500" : "bg-rose-500";
        return /* @__PURE__ */ jsx(
          "div",
          {
            className: `flex-1 rounded-sm transition-all duration-75 ${lit ? color : "bg-border/30"}`,
            style: { height: `${30 + i / bars * 70}%` }
          },
          i
        );
      }) }),
      /* @__PURE__ */ jsxs(
        Button,
        {
          type: "button",
          size: "sm",
          variant: active ? "destructive" : "outline",
          onClick: active ? stop : start,
          className: "h-7 text-[10px] font-mono uppercase tracking-wider gap-1.5 cursor-pointer shrink-0",
          children: [
            /* @__PURE__ */ jsx(Mic, { className: "h-3 w-3" }),
            active ? "Stop" : "Test Mic"
          ]
        }
      )
    ] }),
    active && /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-emerald-400 font-mono animate-pulse flex items-center gap-1", children: [
      /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3 w-3" }),
      "Listening… speak to test your microphone level."
    ] })
  ] });
}
function VoiceSettings({ inline }) {
  const {
    elevenLabsApiKey,
    elevenLabsVoiceId,
    setElevenLabsApiKey,
    setElevenLabsVoiceId,
    audioOutputDeviceId,
    setAudioOutputDeviceId,
    micDeviceId,
    setMicDeviceId
  } = useWorkbench();
  const [open, setOpen] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testError, setTestError] = useState(null);
  const resetDefaults = () => {
    setElevenLabsApiKey("");
    setElevenLabsVoiceId(DEFAULT_VOICE_ID);
    setAudioOutputDeviceId("");
    setMicDeviceId("");
    setTestError(null);
  };
  const handleTestVoice = async () => {
    if (!elevenLabsApiKey) {
      toast.error("Please enter an ElevenLabs API key first.");
      return;
    }
    setTesting(true);
    setTestError(null);
    try {
      const text = "ElevenLabs voice connection successful! Pit Wall audio engine is ready.";
      const resp = await speakText({
        data: { text, apiKey: elevenLabsApiKey, voiceId: elevenLabsVoiceId }
      });
      if (resp.error) {
        setTestError(resp.error);
        toast.error(`Voice test failed: ${resp.error}`);
        return;
      }
      if (!resp.audioBase64) {
        setTestError("No audio returned");
        toast.error("Voice test failed: No audio data returned.");
        return;
      }
      await playAudioOnDevice(resp.audioBase64, resp.mime ?? "audio/mpeg", audioOutputDeviceId);
      toast.success("Voice test played successfully!");
    } catch (e) {
      const msg = e.message || "Unknown error";
      setTestError(msg);
      toast.error(`Voice test failed: ${msg}`);
    } finally {
      setTesting(false);
    }
  };
  if (inline) {
    return /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-widest text-muted-foreground font-semibold border-b border-border/40 pb-1.5", children: "ElevenLabs Credentials" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block", children: "API Key" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              type: "password",
              value: elevenLabsApiKey,
              onChange: (e) => setElevenLabsApiKey(e.target.value),
              placeholder: "sk_...",
              className: "font-mono text-xs bg-background/50 border-border/80 focus:border-primary/50"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block", children: "Voice ID" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              type: "text",
              value: elevenLabsVoiceId,
              onChange: (e) => setElevenLabsVoiceId(e.target.value),
              placeholder: DEFAULT_VOICE_ID,
              className: "font-mono text-xs bg-background/50 border-border/80 focus:border-primary/50"
            }
          ),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-[10px] text-muted-foreground", children: "20-character voice ID from your ElevenLabs account." })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-widest text-muted-foreground font-semibold border-b border-border/40 pb-1.5", children: "Audio Output Device" }),
        /* @__PURE__ */ jsx(
          DeviceSelect,
          {
            kind: "audiooutput",
            value: audioOutputDeviceId,
            onChange: setAudioOutputDeviceId,
            label: "Playback Device",
            hint: "Where ElevenLabs voice and race engineer audio will play.",
            icon: Speaker
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxs(
            Button,
            {
              type: "button",
              variant: "outline",
              size: "sm",
              onClick: handleTestVoice,
              disabled: testing,
              className: "flex-1 font-mono text-[10px] uppercase tracking-wider gap-1.5 h-8 cursor-pointer",
              children: [
                testing ? /* @__PURE__ */ jsx(Loader2, { className: "h-3 w-3 animate-spin" }) : /* @__PURE__ */ jsx(Volume2, { className: "h-3.5 w-3.5 text-primary" }),
                "Test on Selected Device"
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            Button,
            {
              type: "button",
              variant: "ghost",
              size: "sm",
              onClick: resetDefaults,
              className: "font-mono text-[10px] uppercase tracking-wider gap-1.5 h-8 hover:bg-accent/40 cursor-pointer",
              children: [
                /* @__PURE__ */ jsx(RotateCcw, { className: "h-3.5 w-3.5" }),
                "Reset"
              ]
            }
          )
        ] }),
        testError && /* @__PURE__ */ jsxs("div", { className: "rounded border border-rose-500/30 bg-rose-500/5 p-2.5 text-[10px] text-rose-400 font-mono flex items-start gap-1.5 leading-normal animate-in fade-in", children: [
          /* @__PURE__ */ jsx(AlertCircle, { className: "h-3.5 w-3.5 shrink-0" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: "font-semibold uppercase tracking-wider text-[9px] block mb-0.5", children: "Test Error:" }),
            testError
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-widest text-muted-foreground font-semibold border-b border-border/40 pb-1.5", children: "Microphone Input" }),
        /* @__PURE__ */ jsx(
          DeviceSelect,
          {
            kind: "audioinput",
            value: micDeviceId,
            onChange: setMicDeviceId,
            label: "Microphone",
            hint: "Used for voice-to-agent commands and push-to-talk queries.",
            icon: Mic
          }
        ),
        /* @__PURE__ */ jsx(MicLevelMeter, { deviceId: micDeviceId })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs(Sheet, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsx(SheetTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(
      "button",
      {
        className: "flex items-center gap-1.5 rounded-sm px-2 py-1 hover:bg-accent hover:text-foreground",
        title: "Configure voice & audio devices",
        children: [
          /* @__PURE__ */ jsx(Mic, { className: "h-3.5 w-3.5" }),
          "Voice"
        ]
      }
    ) }),
    /* @__PURE__ */ jsxs(
      SheetContent,
      {
        side: "right",
        className: "w-[400px] sm:w-[460px] flex flex-col p-0 bg-background text-foreground",
        children: [
          /* @__PURE__ */ jsxs(SheetHeader, { className: "px-5 pt-5 pb-3 border-b border-border/40", children: [
            /* @__PURE__ */ jsxs(SheetTitle, { className: "font-mono text-sm tracking-wider flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(Radio, { className: "h-4 w-4 text-primary" }),
              "VOICE & AUDIO DEVICES"
            ] }),
            /* @__PURE__ */ jsx(SheetDescription, { className: "text-xs", children: "Configure ElevenLabs credentials, playback device, and microphone." })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-y-auto px-5 py-5 space-y-6", children: [
            /* @__PURE__ */ jsxs("section", { className: "space-y-3", children: [
              /* @__PURE__ */ jsxs("h3", { className: "text-[10px] uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsx(Volume2, { className: "h-3 w-3" }),
                " ElevenLabs Credentials"
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block", children: "API Key" }),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    type: "password",
                    value: elevenLabsApiKey,
                    onChange: (e) => setElevenLabsApiKey(e.target.value),
                    placeholder: "sk_...",
                    className: "font-mono text-xs"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block", children: "Voice ID" }),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    type: "text",
                    value: elevenLabsVoiceId,
                    onChange: (e) => setElevenLabsVoiceId(e.target.value),
                    placeholder: DEFAULT_VOICE_ID,
                    className: "font-mono text-xs"
                  }
                ),
                /* @__PURE__ */ jsx("p", { className: "mt-1 text-[10px] text-muted-foreground", children: "20-character voice ID from your ElevenLabs account." })
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "border-t border-border/40" }),
            /* @__PURE__ */ jsxs("section", { className: "space-y-3", children: [
              /* @__PURE__ */ jsxs("h3", { className: "text-[10px] uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsx(Speaker, { className: "h-3 w-3" }),
                " Audio Output Device"
              ] }),
              /* @__PURE__ */ jsx(
                DeviceSelect,
                {
                  kind: "audiooutput",
                  value: audioOutputDeviceId,
                  onChange: setAudioOutputDeviceId,
                  label: "Playback Device",
                  hint: "ElevenLabs voice and race engineer calls will play through this device.",
                  icon: Speaker
                }
              ),
              /* @__PURE__ */ jsxs(
                Button,
                {
                  type: "button",
                  variant: "outline",
                  size: "sm",
                  onClick: handleTestVoice,
                  disabled: testing,
                  className: "w-full font-mono text-[10px] uppercase tracking-wider gap-1.5 h-8 cursor-pointer",
                  children: [
                    testing ? /* @__PURE__ */ jsx(Loader2, { className: "h-3 w-3 animate-spin" }) : /* @__PURE__ */ jsx(Volume2, { className: "h-3.5 w-3.5 text-primary animate-pulse" }),
                    "Test Voice on Selected Device"
                  ]
                }
              ),
              testError && /* @__PURE__ */ jsxs("div", { className: "rounded border border-rose-500/30 bg-rose-500/5 p-2 text-[10px] text-rose-400 font-mono flex items-start gap-1.5 leading-normal", children: [
                /* @__PURE__ */ jsx(AlertCircle, { className: "h-3.5 w-3.5 shrink-0" }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("span", { className: "font-semibold text-[9px] block", children: "Test Error:" }),
                  " ",
                  testError
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "border-t border-border/40" }),
            /* @__PURE__ */ jsxs("section", { className: "space-y-3", children: [
              /* @__PURE__ */ jsxs("h3", { className: "text-[10px] uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsx(Mic, { className: "h-3 w-3" }),
                " Microphone Input"
              ] }),
              /* @__PURE__ */ jsx(
                DeviceSelect,
                {
                  kind: "audioinput",
                  value: micDeviceId,
                  onChange: setMicDeviceId,
                  label: "Microphone",
                  hint: "Used for push-to-talk voice commands to the AI agent.",
                  icon: Mic
                }
              ),
              /* @__PURE__ */ jsx(MicLevelMeter, { deviceId: micDeviceId }),
              /* @__PURE__ */ jsxs("div", { className: "rounded border border-border/40 bg-muted/20 px-3 py-2.5 text-[10px] text-muted-foreground font-mono leading-relaxed", children: [
                /* @__PURE__ */ jsx("span", { className: "text-foreground font-semibold block mb-0.5", children: "Push-to-Talk" }),
                "Hold ",
                /* @__PURE__ */ jsx("kbd", { className: "rounded bg-border/60 px-1 py-0.5 text-[9px]", children: "Space" }),
                " on the Live dashboard to speak a query to the AI coach. The selected microphone will be used."
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "border-t border-border/40 flex items-center justify-between gap-2 px-5 py-3", children: [
            /* @__PURE__ */ jsxs(
              Button,
              {
                variant: "outline",
                size: "sm",
                onClick: resetDefaults,
                className: "gap-1.5 cursor-pointer",
                children: [
                  /* @__PURE__ */ jsx(RotateCcw, { className: "h-3.5 w-3.5" }),
                  "Reset All"
                ]
              }
            ),
            /* @__PURE__ */ jsx(Button, { size: "sm", onClick: () => setOpen(false), className: "cursor-pointer", children: "Done" })
          ] })
        ]
      }
    )
  ] });
}
function crumbsForPath(pathname, params) {
  if (pathname === "/") return [];
  if (pathname === "/live") return [{ label: "Live", to: "/live" }];
  if (pathname === "/sessions") return [{ label: "Sessions", to: "/sessions" }];
  if (pathname.startsWith("/sessions/") && params.id) {
    return [{ label: "Sessions", to: "/sessions" }, { label: "Workbench" }];
  }
  if (pathname === "/fingerprint") return [{ label: "Fingerprint", to: "/fingerprint" }];
  if (pathname === "/auth") return [{ label: "Sign in" }];
  if (pathname === "/roadmap") return [{ label: "Roadmap", to: "/roadmap" }];
  if (pathname === "/admin") return [{ label: "Admin" }];
  if (pathname === "/how-it-works") return [{ label: "How it works", to: "/how-it-works" }];
  if (pathname.startsWith("/share/")) return [{ label: "Shared lap" }];
  if (pathname.startsWith("/lab/")) return [{ label: "Lab", to: "/lab/lapfile" }];
  return [{ label: pathname.replace(/^\//, "") || "Page" }];
}
function HeaderBreadcrumbs() {
  const { pathname } = useLocation();
  const params = useParams({ strict: false });
  const crumbs = crumbsForPath(pathname, params);
  if (crumbs.length === 0) return null;
  return /* @__PURE__ */ jsxs(
    "nav",
    {
      "aria-label": "Breadcrumb",
      className: "hidden sm:flex items-center gap-1 text-[11px] font-mono text-muted-foreground",
      children: [
        /* @__PURE__ */ jsx(Link, { to: "/", className: "hover:text-foreground transition-colors", children: "Home" }),
        crumbs.map((c, i) => /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsx(ChevronRight, { className: "h-3 w-3 opacity-50" }),
          c.to && i < crumbs.length - 1 ? /* @__PURE__ */ jsx(Link, { to: c.to, className: "hover:text-foreground transition-colors", children: c.label }) : /* @__PURE__ */ jsx("span", { className: "text-foreground/90", children: c.label })
        ] }, `${c.label}-${i}`))
      ]
    }
  );
}
function statusDotColor(status) {
  switch (status) {
    case "active":
      return "#00D17F";
    case "degraded":
      return "#FFB800";
    case "offline":
      return "#FF4D4D";
    case "initializing":
      return "#7A828C";
  }
}
function statusLabel(status) {
  switch (status) {
    case "active":
      return "ACTIVE";
    case "degraded":
      return "DEGRADED";
    case "offline":
      return "OFFLINE";
    case "initializing":
      return "INIT…";
  }
}
function overallStatus(statuses) {
  if (statuses.some((s) => s === "initializing")) return "initializing";
  if (statuses.some((s) => s === "offline" || s === "degraded")) return "degraded";
  return "active";
}
function MonitorRow({
  label,
  icon: Icon,
  status,
  detail,
  latencyMs
}) {
  const color = statusDotColor(status);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "flex items-start gap-2.5 px-3 py-2",
      style: { borderBottom: "1px solid #1C2430" },
      children: [
        /* @__PURE__ */ jsx(
          Icon,
          {
            className: "h-3 w-3 mt-0.5 shrink-0",
            style: { color: "#7A828C" }
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col flex-1 min-w-0 gap-0.5", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-[9px] font-bold uppercase tracking-[0.15em] text-white", children: label }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 shrink-0", children: [
              /* @__PURE__ */ jsx(
                "span",
                {
                  className: "size-1.5 rounded-full shrink-0",
                  style: {
                    backgroundColor: color,
                    boxShadow: status === "active" ? `0 0 4px ${color}` : "none"
                  }
                }
              ),
              /* @__PURE__ */ jsx(
                "span",
                {
                  className: "text-[8px] font-black uppercase tracking-widest",
                  style: { color },
                  children: statusLabel(status)
                }
              ),
              latencyMs !== void 0 && status !== "offline" && /* @__PURE__ */ jsxs("span", { className: "text-[8px] text-[#3D4751] tabular-nums", children: [
                latencyMs,
                "ms"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-[8px] text-[#7A828C] truncate leading-tight", children: detail })
        ] })
      ]
    }
  );
}
function RuntimeMonitor() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const triggerRef = useRef(null);
  const status = useRuntimeStatus();
  const health = overallStatus([
    status.bridge.status,
    status.sessionStore.status
  ]);
  const dotColor = statusDotColor(health);
  const isElectron = typeof window !== "undefined" && window.pitWallRuntime !== void 0;
  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target) && triggerRef.current && !triggerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);
  const handleRestartBridge = async () => {
    if (isElectron && window.pitWallRuntime?.restartBridge) {
      await window.pitWallRuntime.restartBridge();
    } else {
      window.open("http://localhost:3001", "_blank");
    }
  };
  const handleEnsureMongoDB = async () => {
    if (isElectron && window.pitWallRuntime?.ensureMongoDB) {
      await window.pitWallRuntime.ensureMongoDB();
    }
  };
  const handleRefreshAiMode = async () => {
    if (isElectron && window.pitWallRuntime?.refreshAiMode) {
      await window.pitWallRuntime.refreshAiMode();
    }
  };
  const handleOpenDetached = (type) => {
    const url = `${window.location.origin}/detached/${type}`;
    if (isElectron && window.pitWallRuntime?.openInstrumentWindow) {
      window.pitWallRuntime.openInstrumentWindow(type, url);
    } else {
      window.open(url, "_blank", "width=900,height=600");
    }
    setOpen(false);
  };
  return /* @__PURE__ */ jsxs("div", { className: "relative", children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        ref: triggerRef,
        id: "runtime-monitor-trigger",
        onClick: () => setOpen((p) => !p),
        className: "flex items-center gap-1.5 rounded-sm px-2 py-1 transition-all hover:bg-accent",
        title: "Runtime Monitor — click to view workstation service health",
        children: [
          /* @__PURE__ */ jsx(
            "span",
            {
              className: "size-1.5 rounded-full shrink-0",
              style: {
                backgroundColor: dotColor,
                boxShadow: health === "active" ? `0 0 5px ${dotColor}` : health === "degraded" ? `0 0 4px ${dotColor}` : "none",
                animation: health === "initializing" ? "pulse 1.5s infinite" : "none"
              }
            }
          ),
          /* @__PURE__ */ jsx(
            "span",
            {
              className: "font-mono text-[9px] uppercase tracking-widest font-bold",
              style: { color: dotColor },
              children: health === "initializing" ? "INIT" : status.mode === "workstation" ? "WKSTN" : "PRTBL"
            }
          ),
          /* @__PURE__ */ jsx(
            ChevronDown,
            {
              className: "h-3 w-3 text-muted-foreground transition-transform",
              style: { transform: open ? "rotate(180deg)" : "none" }
            }
          )
        ]
      }
    ),
    open && /* @__PURE__ */ jsxs(
      "div",
      {
        ref: panelRef,
        className: "absolute right-0 top-full z-50 mt-1.5 overflow-hidden rounded-sm font-mono shadow-2xl",
        style: {
          width: "360px",
          backgroundColor: "#0B0F14",
          border: "1px solid #1C2430",
          boxShadow: "0 8px 40px rgba(0,0,0,0.7), 0 0 0 1px #1C2430"
        },
        children: [
          /* @__PURE__ */ jsxs(
            "div",
            {
              className: "flex items-center justify-between px-3 py-2 shrink-0",
              style: { borderBottom: "1px solid #1C2430", backgroundColor: "#11161D" },
              children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx(Monitor, { className: "h-3 w-3 text-[#3B82F6]" }),
                  /* @__PURE__ */ jsx("span", { className: "text-[9px] font-bold uppercase tracking-[0.25em] text-white", children: "RUNTIME MONITOR" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxs("span", { className: "text-[8px] text-[#7A828C] tabular-nums", children: [
                    (status.elapsedMs / 1e3).toFixed(0),
                    "s uptime"
                  ] }),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => setOpen(false),
                      className: "rounded p-0.5 text-[#7A828C] hover:text-white transition-colors",
                      children: /* @__PURE__ */ jsx(X, { className: "h-3 w-3" })
                    }
                  )
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsx(
            MonitorRow,
            {
              label: "LOCAL BRIDGE",
              icon: Wifi,
              status: status.bridge.status,
              detail: status.bridge.detail,
              latencyMs: status.bridge.latencyMs
            }
          ),
          /* @__PURE__ */ jsx(
            MonitorRow,
            {
              label: "iRACING SIMULATOR",
              icon: Activity,
              status: status.iracing.status,
              detail: status.iracing.detail
            }
          ),
          /* @__PURE__ */ jsx(
            MonitorRow,
            {
              label: "MONGODB",
              icon: Database,
              status: status.mongoDB.status,
              detail: status.mongoDB.detail
            }
          ),
          /* @__PURE__ */ jsx(
            MonitorRow,
            {
              label: "LOCAL AI",
              icon: Brain,
              status: status.localAi.status,
              detail: status.localAi.detail
            }
          ),
          /* @__PURE__ */ jsx(
            MonitorRow,
            {
              label: "CLOUD AI ENGINE",
              icon: Cpu,
              status: status.aiEngine.status,
              detail: status.aiEngine.detail,
              latencyMs: status.aiEngine.latencyMs
            }
          ),
          /* @__PURE__ */ jsx(
            MonitorRow,
            {
              label: "SESSION STORE",
              icon: Database,
              status: status.sessionStore.status,
              detail: status.sessionStore.detail
            }
          ),
          /* @__PURE__ */ jsx(
            MonitorRow,
            {
              label: "WORKSTATION",
              icon: Monitor,
              status: status.workstation.status,
              detail: status.workstation.detail
            }
          ),
          /* @__PURE__ */ jsxs(
            "div",
            {
              className: "px-3 py-2.5 flex flex-col gap-2",
              style: { borderTop: "1px solid #1C2430", backgroundColor: "#080C10" },
              children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("span", { className: "text-[7.5px] text-[#7A828C] uppercase tracking-widest font-bold block mb-1.5", children: "LAUNCH DETACHED MONITOR" }),
                  /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1", children: [
                    { id: "timing", label: "TIMING" },
                    { id: "tires", label: "TIRE WALL" },
                    { id: "hybrid", label: "HYBRID" },
                    { id: "strategy", label: "STRATEGY" }
                  ].map((m) => /* @__PURE__ */ jsxs(
                    "button",
                    {
                      id: `launch-monitor-${m.id}`,
                      onClick: () => handleOpenDetached(m.id),
                      className: "flex items-center gap-1 rounded-sm px-2 py-1 text-[8px] font-bold uppercase tracking-wider transition-colors hover:opacity-80",
                      style: {
                        backgroundColor: "#1C2430",
                        color: "#E2E4E8",
                        border: "1px solid #263241"
                      },
                      children: [
                        /* @__PURE__ */ jsx(ExternalLink, { className: "h-2.5 w-2.5 text-[#7A828C]" }),
                        m.label
                      ]
                    },
                    m.id
                  )) })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-1.5 pt-1", style: { borderTop: "1px solid #1C2430" }, children: [
                  /* @__PURE__ */ jsxs(
                    "button",
                    {
                      id: "runtime-restart-bridge",
                      onClick: handleRestartBridge,
                      className: "flex items-center gap-1.5 rounded-sm px-2 py-1 text-[8px] font-bold uppercase tracking-wider transition-all hover:opacity-80",
                      style: { backgroundColor: "#1C2430", color: "#7A828C", border: "1px solid #263241" },
                      children: [
                        /* @__PURE__ */ jsx(RefreshCw, { className: "h-2.5 w-2.5" }),
                        "Bridge"
                      ]
                    }
                  ),
                  isElectron && /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsxs(
                      "button",
                      {
                        id: "runtime-ensure-mongodb",
                        onClick: handleEnsureMongoDB,
                        className: "flex items-center gap-1.5 rounded-sm px-2 py-1 text-[8px] font-bold uppercase tracking-wider transition-all hover:opacity-80",
                        style: { backgroundColor: "#1C2430", color: "#7A828C", border: "1px solid #263241" },
                        children: [
                          /* @__PURE__ */ jsx(PlayCircle, { className: "h-2.5 w-2.5" }),
                          "Start MongoDB"
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsxs(
                      "button",
                      {
                        id: "runtime-refresh-ai",
                        onClick: handleRefreshAiMode,
                        className: "flex items-center gap-1.5 rounded-sm px-2 py-1 text-[8px] font-bold uppercase tracking-wider transition-all hover:opacity-80",
                        style: { backgroundColor: "#1C2430", color: "#7A828C", border: "1px solid #263241" },
                        children: [
                          /* @__PURE__ */ jsx(Brain, { className: "h-2.5 w-2.5" }),
                          "Probe AI"
                        ]
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsx("span", { className: "text-[7.5px] text-[#3D4751] uppercase tracking-widest ml-auto", children: isElectron ? "ELECTRON RUNTIME" : "BROWSER RUNTIME" })
                ] })
              ]
            }
          )
        ]
      }
    )
  ] });
}
function AppHeader({ children }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const t = useTelemetry();
  const settingsActive = pathname === "/settings" || pathname.startsWith("/settings/");
  const teamActive = pathname === "/team";
  return /* @__PURE__ */ jsxs("header", { className: "hairline-b flex h-12 items-center bg-panel px-4", children: [
    /* @__PURE__ */ jsx(BackButton, {}),
    /* @__PURE__ */ jsxs(Link, { to: "/sessions", className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx("div", { className: "flex h-6 w-6 items-center justify-center rounded-sm bg-primary text-primary-foreground", children: /* @__PURE__ */ jsx(Activity, { className: "h-3.5 w-3.5" }) }),
      /* @__PURE__ */ jsx("span", { className: "font-mono text-xs tracking-wider", children: "PIT WALL" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mx-4 h-4 w-px bg-border" }),
    /* @__PURE__ */ jsx(HeaderBreadcrumbs, {}),
    /* @__PURE__ */ jsx("div", { className: "mx-3 h-4 w-px bg-border hidden sm:block" }),
    /* @__PURE__ */ jsx("div", { className: "flex flex-1 items-center gap-3 text-xs text-muted-foreground", children }),
    /* @__PURE__ */ jsxs("div", { className: "ml-auto flex items-center gap-4 text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsxs(
        Link,
        {
          to: "/live",
          title: t.connected ? `Bridge live · ${t.track} · ${t.car}` : "Bridge offline — click to go to Live dashboard",
          className: "flex items-center gap-1.5 rounded-sm px-2 py-1 hover:bg-accent transition-all",
          children: [
            /* @__PURE__ */ jsx(
              "span",
              {
                className: `size-1.5 rounded-full ${t.connected ? "bg-emerald-500 shadow-[0_0_6px_#22c55e] animate-pulse" : "bg-amber-500"}`
              }
            ),
            /* @__PURE__ */ jsx("span", { className: `font-mono text-[10px] uppercase tracking-wider ${t.connected ? "text-emerald-400" : "text-amber-500"}`, children: t.connected ? `LIVE` : "SIM" }),
            t.connected && /* @__PURE__ */ jsx("span", { className: "font-mono text-[10px] text-muted-foreground hidden lg:inline truncate max-w-36", children: t.track })
          ]
        }
      ),
      /* @__PURE__ */ jsx(RuntimeMonitor, {}),
      /* @__PURE__ */ jsxs(
        Link,
        {
          to: "/team",
          className: `flex items-center gap-1.5 rounded-sm px-2 py-1 transition-all group ${teamActive ? "bg-primary/15 text-primary ring-1 ring-primary/40 font-semibold" : "hover:bg-accent hover:text-foreground text-muted-foreground"}`,
          children: [
            /* @__PURE__ */ jsx(Users, { className: "h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" }),
            /* @__PURE__ */ jsx("span", { children: "Team" })
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        Link,
        {
          to: "/settings",
          className: `flex items-center gap-1.5 rounded-sm px-2 py-1 transition-all group ${settingsActive ? "bg-primary/15 text-primary ring-1 ring-primary/40 font-semibold" : "hover:bg-accent hover:text-foreground text-muted-foreground"}`,
          children: [
            /* @__PURE__ */ jsx(
              Settings,
              {
                className: `h-3.5 w-3.5 transition-transform duration-500 group-hover:rotate-90 ${settingsActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`
              }
            ),
            /* @__PURE__ */ jsx("span", { children: "Settings" })
          ]
        }
      ),
      user ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("span", { className: "font-mono", children: user.email }),
        /* @__PURE__ */ jsx(LLMSettings, {}),
        /* @__PURE__ */ jsx(VoiceSettings, {}),
        /* @__PURE__ */ jsx(LocalDbSettings, {}),
        /* @__PURE__ */ jsx(ThemeEditor, {}),
        /* @__PURE__ */ jsxs(
          "button",
          {
            className: "flex items-center gap-1.5 rounded-sm px-2 py-1 hover:bg-accent hover:text-foreground",
            onClick: async () => {
              await signOut();
              navigate({ to: "/" });
            },
            children: [
              /* @__PURE__ */ jsx(LogOut, { className: "h-3.5 w-3.5" }),
              "Sign out"
            ]
          }
        )
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("span", { className: "font-mono uppercase tracking-wider text-racing-orange", children: "Guest" }),
        /* @__PURE__ */ jsx(LLMSettings, {}),
        /* @__PURE__ */ jsx(VoiceSettings, {}),
        /* @__PURE__ */ jsx(LocalDbSettings, {}),
        /* @__PURE__ */ jsx(ThemeEditor, {}),
        /* @__PURE__ */ jsx(
          Link,
          {
            to: "/auth",
            className: "rounded-sm bg-primary px-2.5 py-1 font-medium text-primary-foreground hover:opacity-90",
            children: "Sign in"
          }
        )
      ] })
    ] })
  ] });
}
export {
  AppHeader as A,
  LLMSettings as L,
  ThemeEditor as T,
  VoiceSettings as V,
  LocalDbSettings as a
};

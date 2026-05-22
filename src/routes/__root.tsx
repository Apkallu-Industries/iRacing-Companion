import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect } from "react";

import appCss from "../styles.css?url";
import upCss from "uplot/dist/uPlot.min.css?url";
import { AuthProvider } from "@/lib/auth";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/lib/themeContext";
import { supabase } from "@/integrations/supabase/client";


function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https:",
  // Supabase + local bridge WebSocket for /live
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co ws://localhost:* ws://127.0.0.1:*",
  "worker-src 'self' blob:",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { httpEquiv: "Content-Security-Policy", content: CSP },
      { name: "referrer", content: "strict-origin-when-cross-origin" },
      { title: "Pit Wall — Live iRacing Telemetry & Lap Analysis" },
      {
        name: "description",
        content:
          "Pit Wall combines live iRacing telemetry from a local bridge with a MoTeC-style .ibt lap analysis workbench.",
      },
      { name: "author", content: "Pit Wall" },
      { property: "og:site_name", content: "Pit Wall" },
      { property: "og:title", content: "Pit Wall — Live iRacing Telemetry & Lap Analysis" },
      {
        property: "og:description",
        content:
          "Live telemetry dashboard + .ibt lap analysis workbench, AI coach and sharing.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Pit Wall — Live iRacing Telemetry & Lap Analysis" },
      {
        name: "twitter:description",
        content:
          "Live telemetry dashboard + .ibt lap analysis workbench, AI coach and sharing.",
      },
      { name: "theme-color", content: "#1a1d21" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: "Pit Wall" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "description", content: "- RaceDash Live streams sim racing telemetry to a web UI, integrating multiple specialized apps for enhanced analysis and customization." },
      { property: "og:description", content: "- RaceDash Live streams sim racing telemetry to a web UI, integrating multiple specialized apps for enhanced analysis and customization." },
      { name: "twitter:description", content: "- RaceDash Live streams sim racing telemetry to a web UI, integrating multiple specialized apps for enhanced analysis and customization." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/85825c68-32b0-4129-8f2d-465393244aa0/id-preview-0568334a--1a04b9c0-7f59-490a-9be8-13c849227142.lovable.app-1779125690570.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/85825c68-32b0-4129-8f2d-465393244aa0/id-preview-0568334a--1a04b9c0-7f59-490a-9be8-13c849227142.lovable.app-1779125690570.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "stylesheet", href: upCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="bg-background text-foreground">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      router.invalidate();
      queryClient.invalidateQueries();
    });
    return () => subscription.unsubscribe();
  }, [router, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <BackButton />
          <Outlet />
          <Toaster />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
    Outlet,
    Link,
    createRootRouteWithContext,
    useRouter,
    HeadContent,
    Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AuthProvider } from "../lib/auth-context";

function NotFoundComponent() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <div className="max-w-md text-center">
                <h1 className="text-7xl font-bold gradient-text">404</h1>
                <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    The route you're looking for doesn't exist.
                </p>
                <Link
                    to="/"
                    className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                >
                    Go home
                </Link>
            </div>
        </div>
    );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
    const router = useRouter();
    useEffect(() => {
        reportLovableError(error, { boundary: "tanstack_root_error_component" });
    }, [error]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <div className="max-w-md text-center">
                <h1 className="text-xl font-semibold">This page didn't load</h1>
                <p className="mt-2 text-sm text-muted-foreground">Something went wrong.</p>
                <div className="mt-6 flex justify-center gap-2">
                    <button
                        onClick={() => { router.invalidate(); reset(); }}
                        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                    >
                        Try again
                    </button>
                    <a href="/" className="rounded-md border px-4 py-2 text-sm">Go home</a>
                </div>
            </div>
        </div>
    );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
    head: () => ({
        meta: [
            { charSet: "utf-8" },
            { name: "viewport", content: "width=device-width, initial-scale=1" },
            { title: "VoltFleet AI — Intelligent EV Fleet Monitoring" },
            { name: "description", content: "Real-time EV fleet monitoring and predictive analytics. Track battery health, optimize routes, and maximize fleet uptime." },
            { property: "og:title", content: "VoltFleet AI — Intelligent EV Fleet Monitoring" },
            { property: "og:description", content: "Real-time EV fleet monitoring and predictive analytics. Track battery health, optimize routes, and maximize fleet uptime." },
            { property: "og:type", content: "website" },
            { name: "twitter:card", content: "summary_large_image" },
            { name: "twitter:title", content: "VoltFleet AI — Intelligent EV Fleet Monitoring" },
            { name: "twitter:description", content: "Real-time EV fleet monitoring and predictive analytics. Track battery health, optimize routes, and maximize fleet uptime." },
            { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/9d82c655-5702-4cfd-8ea9-75fd31d652d5/id-preview-e7d03f10--48e419d4-c9c3-4969-8431-c32552459536.lovable.app-1780900677543.png" },
            { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/9d82c655-5702-4cfd-8ea9-75fd31d652d5/id-preview-e7d03f10--48e419d4-c9c3-4969-8431-c32552459536.lovable.app-1780900677543.png" },
        ],
        links: [
            { rel: "preconnect", href: "https://fonts.googleapis.com" },
            { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
            { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700&family=Sora:wght@500;600;700;800&display=swap" },
            { rel: "stylesheet", href: appCss },
        ],
    }),
    shellComponent: RootShell,
    component: RootComponent,
    notFoundComponent: NotFoundComponent,
    errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
    return (
        <html lang="en" className="dark">
            <head>
                <HeadContent />
            </head>
            <body>
                {children}
                <Scripts />
            </body>
        </html>
    );
}

function RootComponent() {
    const { queryClient } = Route.useRouteContext();

    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <TooltipProvider delayDuration={150}>
                    <Outlet />
                    <Toaster position="top-right" richColors theme="dark" />
                </TooltipProvider>
            </AuthProvider>
        </QueryClientProvider>
    );
}

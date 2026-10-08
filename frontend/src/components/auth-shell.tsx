import { Link } from "@tanstack/react-router";
import { Zap } from "lucide-react";
import type { ReactNode } from "react";

export function AuthShell({ title, subtitle, children, footer }: {
    title: string; subtitle?: string; children: ReactNode; footer?: ReactNode;
}) {
    return (
        <div className="relative min-h-screen overflow-hidden">
            <div className="pointer-events-none absolute inset-0 opacity-70" style={{ backgroundImage: "var(--gradient-glow)" }} />
            <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

            <div className="relative mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
                <Link to="/" className="mb-8 inline-flex items-center gap-2.5">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-secondary">
                        <Zap className="h-5 w-5 text-background" strokeWidth={2.5} />
                    </div>
                    <span className="font-display text-lg font-semibold">VoltFleet AI</span>
                </Link>

                <div className="glass rounded-2xl p-8">
                    <h1 className="font-display text-2xl font-semibold">{title}</h1>
                    {subtitle && <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>}
                    <div className="mt-6">{children}</div>
                </div>

                {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
            </div>
        </div>
    );
}

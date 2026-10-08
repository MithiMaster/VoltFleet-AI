import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthShell } from "@/components/auth-shell";
import { useState } from "react";
import { Mail, Lock, User, Building2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/register")({
    head: () => ({ meta: [{ title: "Create account — VoltFleet AI" }] }),
    component: RegisterChoice,
});

function RegisterChoice() {
    return (
        <AuthShell
            title="Join VoltFleet AI"
            subtitle="Select your role to get started"
            footer={<>Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link></>}
        >
            <div className="space-y-4">
                <Link to="/register-manager" className="group flex items-center gap-4 rounded-xl border border-border bg-card/50 p-5 transition hover:border-primary/50 hover:bg-card/80">
                    <div className="grid h-14 w-14 place-items-center rounded-xl bg-gradient-to-br from-primary to-secondary text-background shadow-[var(--shadow-glow)]">
                        <Building2 className="h-7 w-7" />
                    </div>
                    <div className="flex-1">
                        <div className="font-display text-lg font-semibold">Fleet Manager</div>
                        <div className="text-sm text-muted-foreground">Manage your entire EV fleet, drivers, and analytics</div>
                    </div>
                    <svg className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </Link>

                <Link to="/register-driver" className="group flex items-center gap-4 rounded-xl border border-border bg-card/50 p-5 transition hover:border-secondary/50 hover:bg-card/80">
                    <div className="grid h-14 w-14 place-items-center rounded-xl bg-gradient-to-br from-secondary to-emerald-400 text-background shadow-[0_0_20px_oklch(0.78_0.2_160_/_30%)]">
                        <User className="h-7 w-7" />
                    </div>
                    <div className="flex-1">
                        <div className="font-display text-lg font-semibold">Driver</div>
                        <div className="text-sm text-muted-foreground">View your assigned vehicle, trips, and performance</div>
                    </div>
                    <svg className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </Link>
            </div>
        </AuthShell>
    );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell } from "@/components/auth-shell";
import { Mail } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({
    head: () => ({ meta: [{ title: "Reset password — VoltFleet AI" }] }),
    component: Forgot,
});

function Forgot() {
    return (
        <AuthShell
            title="Reset your password"
            subtitle="We'll send a reset link to your email"
            footer={<><Link to="/login" className="text-primary hover:underline">Back to sign in</Link></>}
        >
            <form onSubmit={(e) => { e.preventDefault(); toast.success("Reset link sent"); }} className="space-y-4">
                <div className="flex items-center rounded-lg border border-border bg-card/50 px-3 focus-within:border-primary/50">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <input required type="email" placeholder="you@fleet.com" className="auth-input" />
                </div>
                <button className="w-full rounded-lg bg-gradient-to-r from-primary to-secondary py-2.5 font-medium text-background shadow-[var(--shadow-glow)]">Send reset link</button>
            </form>
        </AuthShell>
    );
}


import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell } from "@/components/auth-shell";
import { MailCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/verify-email")({
    head: () => ({ meta: [{ title: "Verify email — VoltFleet AI" }] }),
    component: Verify,
});

function Verify() {
    return (
        <AuthShell title="Verify your email" subtitle="We sent a verification link to your inbox.">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-primary/30 to-secondary/20 text-primary">
                <MailCheck className="h-7 w-7" />
            </div>
            <p className="mt-5 text-center text-sm text-muted-foreground">
                Click the link in the email to activate your VoltFleet account. The link expires in 24 hours.
            </p>
            <div className="mt-6 space-y-2">
                <button onClick={() => toast.success("Verification email resent")} className="w-full rounded-lg border border-border bg-card/40 py-2.5 text-sm font-medium hover:bg-card">Resend email</button>
                <Link to="/login" className="block w-full rounded-lg bg-gradient-to-r from-primary to-secondary py-2.5 text-center text-sm font-medium text-background">Continue to sign in</Link>
            </div>
        </AuthShell>
    );
}


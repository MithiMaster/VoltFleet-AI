import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthShell } from "@/components/auth-shell";
import { useState } from "react";
import { Mail, Lock, User, Car } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/register-driver")({
    head: () => ({ meta: [{ title: "Register as Driver — VoltFleet AI" }] }),
    component: RegisterDriverPage,
});

function RegisterDriverPage() {
    const nav = useNavigate();
    const { register } = useAuth();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ first_name: "", last_name: "", email: "", password: "" });

    const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((f) => ({ ...f, [field]: e.target.value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await register({ ...form, company: "", role: "driver" });
            toast.success("Driver account created — welcome aboard!");
            nav({ to: "/app" });
        } catch (err: any) {
            toast.error(err.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthShell
            title="Driver account"
            subtitle="Access your vehicle, trips, and performance dashboard"
            footer={<>Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link></>}
        >
            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-secondary/15 px-3 py-1 text-xs font-medium text-secondary">
                    <Car className="h-3.5 w-3.5" /> Driver
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                    <Field icon={User}><input required placeholder="First name" value={form.first_name} onChange={update("first_name")} className="auth-input" /></Field>
                    <Field icon={User}><input required placeholder="Last name" value={form.last_name} onChange={update("last_name")} className="auth-input" /></Field>
                </div>
                <Field icon={Mail}><input required type="email" placeholder="Work email" value={form.email} onChange={update("email")} className="auth-input" /></Field>
                <Field icon={Lock}><input required type="password" placeholder="Password (min 6 chars)" minLength={6} value={form.password} onChange={update("password")} className="auth-input" /></Field>
                <label className="flex items-start gap-2 text-xs text-muted-foreground">
                    <input type="checkbox" required className="mt-0.5 accent-secondary" />
                    I agree to the Terms of Service and Privacy Policy.
                </label>
                <button disabled={loading} className="w-full rounded-lg bg-gradient-to-r from-secondary to-emerald-400 py-2.5 font-medium text-background shadow-[0_0_20px_oklch(0.78_0.2_160_/_30%)] disabled:opacity-50">
                    {loading ? "Creating account…" : "Create Driver account"}
                </button>
                <div className="text-center text-xs text-muted-foreground">
                    <Link to="/register-manager" className="text-primary hover:underline">Register as a Fleet Manager instead →</Link>
                </div>
            </form>
        </AuthShell>
    );
}

function Field({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
    return (
        <div className="flex items-center rounded-lg border border-border bg-card/50 px-3 focus-within:border-secondary/50">
            <Icon className="h-4 w-4 text-muted-foreground" />{children}
        </div>
    );
}

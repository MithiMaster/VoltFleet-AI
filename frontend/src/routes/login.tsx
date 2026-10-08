import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthShell } from "@/components/auth-shell";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/login")({
    head: () => ({ meta: [{ title: "Sign in — VoltFleet AI" }] }),
    component: LoginPage,
});

function LoginPage() {
    const nav = useNavigate();
    const { login, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<"manager" | "driver">("manager");
    const [show, setShow] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const loggedInUser = await login(email, password);
            if (activeTab === "manager" && loggedInUser.role !== "manager") {
                logout();
                toast.error("This account is not registered as a Fleet Manager. Please use the Driver login tab.");
                return;
            }
            if (activeTab === "driver" && loggedInUser.role !== "driver") {
                logout();
                toast.error("This account is not registered as a Driver. Please use the Fleet Manager login tab.");
                return;
            }
            toast.success("Signed in successfully");
            nav({ to: "/app" });
        } catch (err: any) {
            toast.error(err.message || "Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthShell
            title={activeTab === "manager" ? "Fleet Manager Control" : "Driver Portal"}
            subtitle={activeTab === "manager" ? "Sign in to manage your entire EV fleet" : "Sign in to access your assigned vehicle and trips"}
            footer={<>Don't have an account? <Link to="/register" className="text-primary hover:underline">Create one</Link></>}
        >
            <div className="mb-6 flex rounded-lg bg-card/60 p-1 border border-border/60">
                <button
                    type="button"
                    onClick={() => {
                        setActiveTab("manager");
                        setEmail("");
                        setPassword("");
                    }}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition duration-200 ${
                        activeTab === "manager"
                            ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md"
                            : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                    Fleet Manager
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setActiveTab("driver");
                        setEmail("");
                        setPassword("");
                    }}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition duration-200 ${
                        activeTab === "driver"
                            ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md"
                            : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                    Driver Portal
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <Field icon={Mail}>
                    <input 
                        required 
                        type="email" 
                        placeholder={activeTab === "manager" ? "you@fleet.com" : "driver@voltgrid.com"} 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        className="auth-input" 
                    />
                </Field>
                <Field icon={Lock}>
                    <input 
                        required 
                        type={show ? "text" : "password"} 
                        placeholder="••••••••" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        className="auth-input" 
                    />
                    <button type="button" onClick={() => setShow((s) => !s)} className="px-2 text-muted-foreground">
                        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </Field>
                <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 text-muted-foreground">
                        <input type="checkbox" className="accent-primary" defaultChecked /> Remember me
                    </label>
                    <Link to="/forgot-password" className="text-primary hover:underline">Forgot password?</Link>
                </div>
                <button 
                    disabled={loading} 
                    className={`w-full rounded-lg py-2.5 font-medium text-white shadow-md disabled:opacity-50 transition duration-200 ${
                        activeTab === "manager" 
                            ? "bg-gradient-to-r from-violet-600 to-indigo-600 shadow-violet-500/20" 
                            : "bg-gradient-to-r from-emerald-600 to-teal-600 shadow-emerald-500/20"
                    }`}
                >
                    {loading ? "Signing in…" : "Sign in"}
                </button>
            </form>
        </AuthShell>
    );
}

function Field({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
    return (
        <div className="flex items-center rounded-lg border border-border bg-card/50 px-3 focus-within:border-primary/50">
            <Icon className="h-4 w-4 text-muted-foreground" />
            {children}
        </div>
    );
}

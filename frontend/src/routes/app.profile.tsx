import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Mail, Phone, Building2, MapPin, User, LogOut, Edit2, Check, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/profile")({
    head: () => ({ meta: [{ title: "Profile — VoltFleet AI" }] }),
    component: Profile,
});

function Profile() {
    const { user, logout, updateProfile } = useAuth();
    const nav = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form states
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");
    const [location, setLocation] = useState("");
    const [company, setCompany] = useState("");

    // Initialize form states
    useEffect(() => {
        if (user) {
            setFirstName(user.first_name || "");
            setLastName(user.last_name || "");
            setPhone(user.phone || "");
            setLocation(user.location || "");
            setCompany(user.company || "");
        }
    }, [user, isEditing]);

    if (!user) return null;

    const initials = `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();
    const fullName = `${firstName} ${lastName}`;
    const roleLabel = user.role === "manager" ? "Fleet Manager" : "Driver";

    const handleLogout = () => {
        logout();
        nav({ to: "/login" });
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await updateProfile({
                first_name: firstName,
                last_name: lastName,
                phone,
                location,
                company
            });
            toast.success("Profile updated successfully");
            setIsEditing(false);
        } catch (err: any) {
            toast.error(err.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    const stats = user.role === "manager" 
        ? [["152", "Vehicles"], ["48", "Drivers"], ["99.4%", "Uptime"]]
        : [["1", "Vehicle"], ["98.2%", "Safety Score"], ["4.9★", "Rating"]];

    return (
        <div className="space-y-5">
            <PageHeader title="Profile" subtitle="Manage your VoltFleet account." />

            <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
                {/* Left Card: Summary & Quick Actions */}
                <div className="glass rounded-2xl p-6 text-center flex flex-col justify-between">
                    <div>
                        <div className="mx-auto grid h-24 w-24 place-items-center rounded-2xl bg-gradient-to-br from-primary to-secondary font-display text-3xl font-semibold text-background shadow-[var(--shadow-glow)]">
                            {initials}
                        </div>
                        <div className="mt-4 font-display text-xl font-semibold">{fullName}</div>
                        <div className="text-sm text-muted-foreground">{user.role === "manager" ? "VP Operations" : "Fleet Driver"} · {user.company}</div>
                        <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">
                            {roleLabel}
                        </div>
                        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                            {stats.map(([v, l]) => (
                                <div key={l} className="rounded-lg bg-card/40 p-2">
                                    <div className="font-display text-lg font-semibold">{v}</div>
                                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{l}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleLogout} 
                        className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-destructive/10 hover:bg-destructive/20 text-destructive px-4 py-2.5 text-sm font-medium transition duration-200"
                    >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                    </button>
                </div>

                {/* Right Card: Detail Fields Form */}
                <div className="glass space-y-4 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                        <h3 className="font-display text-lg font-semibold">Account details</h3>
                        {!isEditing ? (
                            <button 
                                onClick={() => setIsEditing(true)} 
                                className="flex items-center gap-1.5 rounded-lg border border-border bg-card/50 hover:bg-card px-3 py-1.5 text-xs font-medium transition duration-200"
                            >
                                <Edit2 className="h-3 w-3" />
                                <span>Edit Profile</span>
                            </button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={handleSave} 
                                    disabled={loading}
                                    className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-primary to-secondary px-3 py-1.5 text-xs font-medium text-background hover:opacity-90 disabled:opacity-50 transition duration-200"
                                >
                                    <Check className="h-3 w-3" />
                                    <span>{loading ? "Saving..." : "Save"}</span>
                                </button>
                                <button 
                                    onClick={() => setIsEditing(false)} 
                                    disabled={loading}
                                    className="flex items-center gap-1 rounded-lg border border-border bg-card/40 px-3 py-1.5 text-xs font-medium transition duration-200"
                                >
                                    <X className="h-3 w-3" />
                                    <span>Cancel</span>
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <Item icon={User} label="First Name">
                            {isEditing ? (
                                <input 
                                    type="text" 
                                    value={firstName} 
                                    onChange={(e) => setFirstName(e.target.value)} 
                                    className="auth-input mt-1 w-full bg-card/50 px-2.5 py-1 text-sm border border-border rounded-md focus:border-primary/50 focus:outline-none" 
                                />
                            ) : (
                                <div className="text-sm font-medium mt-1">{firstName}</div>
                            )}
                        </Item>
                        <Item icon={User} label="Last Name">
                            {isEditing ? (
                                <input 
                                    type="text" 
                                    value={lastName} 
                                    onChange={(e) => setLastName(e.target.value)} 
                                    className="auth-input mt-1 w-full bg-card/50 px-2.5 py-1 text-sm border border-border rounded-md focus:border-primary/50 focus:outline-none" 
                                />
                            ) : (
                                <div className="text-sm font-medium mt-1">{lastName}</div>
                            )}
                        </Item>
                    </div>

                    <Item icon={Mail} label="Email">
                        {/* Email is read-only in both states */}
                        <div className="text-sm font-medium mt-1 text-muted-foreground">{user.email}</div>
                    </Item>

                    <Item icon={Phone} label="Phone">
                        {isEditing ? (
                            <input 
                                type="text" 
                                value={phone} 
                                onChange={(e) => setPhone(e.target.value)} 
                                className="auth-input mt-1 w-full bg-card/50 px-2.5 py-1 text-sm border border-border rounded-md focus:border-primary/50 focus:outline-none" 
                            />
                        ) : (
                            <div className="text-sm font-medium mt-1">{phone || "Not set"}</div>
                        )}
                    </Item>

                    <Item icon={Building2} label="Organization">
                        {isEditing && user.role === "manager" ? (
                            <input 
                                type="text" 
                                value={company} 
                                onChange={(e) => setCompany(e.target.value)} 
                                className="auth-input mt-1 w-full bg-card/50 px-2.5 py-1 text-sm border border-border rounded-md focus:border-primary/50 focus:outline-none" 
                            />
                        ) : (
                            <div className="text-sm font-medium mt-1">{company || "Not set"}</div>
                        )}
                    </Item>

                    <Item icon={MapPin} label="Location">
                        {isEditing ? (
                            <input 
                                type="text" 
                                value={location} 
                                onChange={(e) => setLocation(e.target.value)} 
                                className="auth-input mt-1 w-full bg-card/50 px-2.5 py-1 text-sm border border-border rounded-md focus:border-primary/50 focus:outline-none" 
                            />
                        ) : (
                            <div className="text-sm font-medium mt-1">{location || "Not set"}</div>
                        )}
                    </Item>

                    {isEditing && (
                        <div className="flex gap-2 pt-2 justify-end">
                            <button 
                                onClick={handleSave} 
                                disabled={loading}
                                className="rounded-lg bg-gradient-to-r from-primary to-secondary px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50 transition duration-200"
                            >
                                {loading ? "Saving changes..." : "Save changes"}
                            </button>
                            <button 
                                onClick={() => setIsEditing(false)} 
                                disabled={loading}
                                className="rounded-lg border border-border bg-card/40 px-4 py-2 text-sm transition duration-200"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function Item({ icon: Icon, label, children }: { icon: React.ElementType; label: string; children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/40 p-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="h-4 w-4" /></div>
            <div className="flex-1">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
                {children}
            </div>
        </div>
    );
}

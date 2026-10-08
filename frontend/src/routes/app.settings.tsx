import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Building2, Truck, Bell, Users, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/app/settings")({
    head: () => ({ meta: [{ title: "Settings — VoltFleet AI" }] }),
    component: SettingsPage,
});

const sections = [
    { id: "company", title: "Company information", icon: Building2 },
    { id: "fleet", title: "Fleet configuration", icon: Truck },
    { id: "notify", title: "Notification preferences", icon: Bell },
    { id: "users", title: "User management", icon: Users },
    { id: "security", title: "Security", icon: ShieldCheck },
];

function SettingsPage() {
    return (
        <div className="space-y-5">
            <PageHeader title="Settings" subtitle="Configure your VoltFleet workspace." />
            <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
                <nav className="glass space-y-1 rounded-2xl p-2">
                    {sections.map((s) => (
                        <a key={s.id} href={`#${s.id}`} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-card/50 hover:text-foreground">
                            <s.icon className="h-4 w-4" /> {s.title}
                        </a>
                    ))}
                </nav>
                <div className="space-y-4">
                    <Card id="company" title="Company information">
                        <Row label="Company name"><input defaultValue="MetroFleet Logistics" className="auth-input" /></Row>
                        <Row label="Industry"><input defaultValue="Commercial Fleet Operations" className="auth-input" /></Row>
                        <Row label="Headquarters"><input defaultValue="San Francisco, CA" className="auth-input" /></Row>
                    </Card>
                    <Card id="fleet" title="Fleet configuration">
                        <Row label="Default depot"><input defaultValue="SF Depot A" className="auth-input" /></Row>
                        <Row label="SoC alert threshold"><input defaultValue="20%" className="auth-input" /></Row>
                        <Row label="Geofence radius"><input defaultValue="500 m" className="auth-input" /></Row>
                    </Card>
                    <Card id="notify" title="Notification preferences">
                        {[
                            ["Critical alerts (SMS + push)", true],
                            ["Maintenance reminders", true],
                            ["Weekly performance digest", true],
                            ["Marketing emails", false],
                        ].map(([l, on]) => (
                            <Row key={l as string} label={l as string}><Toggle defaultChecked={on as boolean} /></Row>
                        ))}
                    </Card>
                    <Card id="users" title="User management">
                        <div className="space-y-2">
                            {[
                                { n: "Helena Mora", r: "Owner", e: "helena@metrofleet.com" },
                                { n: "Daniel Park", r: "Fleet Manager", e: "daniel@metrofleet.com" },
                                { n: "Sofia Reyes", r: "Driver", e: "sofia@metrofleet.com" },
                            ].map((u) => (
                                <div key={u.e} className="flex items-center justify-between rounded-lg border border-border/50 bg-card/40 p-3">
                                    <div>
                                        <div className="text-sm font-medium">{u.n}</div>
                                        <div className="text-xs text-muted-foreground">{u.e}</div>
                                    </div>
                                    <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary">{u.r}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                    <Card id="security" title="Security">
                        <Row label="Two-factor authentication"><Toggle defaultChecked /></Row>
                        <Row label="Single sign-on (SSO)"><Toggle /></Row>
                        <Row label="Session timeout"><input defaultValue="30 minutes" className="auth-input" /></Row>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function Card({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
    return (
        <section id={id} className="glass rounded-2xl p-5">
            <h3 className="font-display text-lg font-semibold">{title}</h3>
            <div className="mt-3 space-y-3">{children}</div>
        </section>
    );
}
function Row({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-2 border-b border-border/30 py-2 last:border-0 sm:flex-row sm:items-center">
            <div className="w-56 text-sm text-muted-foreground">{label}</div>
            <div className="flex-1">
                <div className="rounded-lg border border-border bg-card/50 px-3">{children}</div>
            </div>
        </div>
    );
}
function Toggle({ defaultChecked }: { defaultChecked?: boolean }) {
    return (
        <label className="my-1.5 flex items-center">
            <input type="checkbox" defaultChecked={defaultChecked} className="peer sr-only" />
            <span className="relative h-5 w-9 rounded-full bg-muted transition peer-checked:bg-gradient-to-r peer-checked:from-primary peer-checked:to-secondary">
                <span className="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-foreground transition peer-checked:translate-x-4" />
            </span>
        </label>
    );
}

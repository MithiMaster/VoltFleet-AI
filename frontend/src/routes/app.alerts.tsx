import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/app/alerts")({
    head: () => ({ meta: [{ title: "Alerts — VoltFleet AI" }] }),
    component: Alerts,
});

const API_BASE = "http://localhost:8000";

const toneOf = (t: string) =>
    t === "critical" ? { dot: "bg-rose-400 animate-pulse", chip: "bg-rose-500/15 text-rose-300" }
        : t === "warning" ? { dot: "bg-amber-400", chip: "bg-amber-500/15 text-amber-300" }
            : { dot: "bg-primary", chip: "bg-primary/15 text-primary" };

function Alerts() {
    const { token, user } = useAuth();
    const [alertsList, setAlertsList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) return;
        setLoading(true);
        fetch(`${API_BASE}/api/alerts/`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(data => {
                if (Array.isArray(data)) {
                    const mapped = data.map((a: any) => ({
                        id: a.id,
                        type: a.type,
                        title: a.title,
                        vehicle: a.vehicle_id,
                        time: a.created_at ? new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"
                    }));
                    setAlertsList(mapped);
                } else {
                    setAlertsList([]);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [token]);

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        );
    }

    const summary = {
        critical: alertsList.filter(a => a.type === "critical").length,
        warning: alertsList.filter(a => a.type === "warning").length,
        info: alertsList.filter(a => a.type === "info").length,
    };

    return (
        <div className="space-y-5">
            <PageHeader 
                title={user?.role === "driver" ? "My Alerts" : "Alerts"} 
                subtitle={user?.role === "driver" ? "Real-time notifications and telemetry alerts for your assigned vehicle." : "Real-time notifications across the fleet."} 
            />
            <div className="grid gap-4 sm:grid-cols-4">
                <Tile label="Critical" value={summary.critical} tone="text-rose-300" />
                <Tile label="Warnings" value={summary.warning} tone="text-amber-300" />
                <Tile label="Information" value={summary.info} tone="text-primary" />
                <Tile label="Resolved (24h)" value={47} tone="text-secondary" />
            </div>

            <div className="glass overflow-hidden rounded-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-card/40 text-xs uppercase tracking-wider text-muted-foreground">
                            <tr>{["Severity", "Title", "Vehicle", "Time", ""].map(h => <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>)}</tr>
                        </thead>
                        <tbody>
                            {alertsList.map((a) => {
                                const t = toneOf(a.type);
                                return (
                                    <tr key={a.id} className="border-t border-border/40 hover:bg-card/30">
                                        <td className="px-4 py-3"><div className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${t.dot}`} /><span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider ${t.chip}`}>{a.type}</span></div></td>
                                        <td className="px-4 py-3 font-medium">{a.title}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{a.vehicle}</td>
                                        <td className="px-4 py-3 text-xs text-muted-foreground">{a.time}</td>
                                        <td className="px-4 py-3 text-right"><button className="rounded-md border border-border bg-card/60 px-3 py-1 text-xs hover:bg-card">Acknowledge</button></td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function Tile({ label, value, tone }: { label: string; value: React.ReactNode; tone: string }) {
    return <div className="glass rounded-2xl p-5"><div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div><div className={`mt-1 font-display text-3xl font-semibold ${tone}`}>{value}</div></div>;
}

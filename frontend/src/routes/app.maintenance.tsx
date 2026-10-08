import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { CalendarDays, AlertTriangle, CircleCheck, Wrench } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/app/maintenance")({
    head: () => ({ meta: [{ title: "Predictive Maintenance — VoltFleet AI" }] }),
    component: Maintenance,
});

const API_BASE = "http://localhost:8000";

const toneMap = {
    healthy: { ring: "ring-secondary/40", text: "text-secondary", bg: "bg-secondary/15", icon: CircleCheck },
    warning: { ring: "ring-amber-400/40", text: "text-amber-300", bg: "bg-amber-400/15", icon: AlertTriangle },
    critical: { ring: "ring-rose-400/40", text: "text-rose-300", bg: "bg-rose-400/15", icon: AlertTriangle },
};

function Maintenance() {
    const { token } = useAuth();
    const [maintenanceList, setMaintenanceList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) return;
        setLoading(true);
        fetch(`${API_BASE}/api/maintenance/`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(data => {
                const mapped = data.map((m: any) => ({
                    id: m.id,
                    task: m.task,
                    vehicle: m.vehicle_id,
                    due: m.due,
                    status: m.status
                }));
                setMaintenanceList(mapped);
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
        healthy: maintenanceList.filter(m => m.status === "healthy").length,
        warning: maintenanceList.filter(m => m.status === "warning").length,
        critical: maintenanceList.filter(m => m.status === "critical").length,
    };

    return (
        <div className="space-y-5">
            <PageHeader title="Predictive maintenance" subtitle="ML-driven failure forecasts and service scheduling." />

            <div className="grid gap-4 sm:grid-cols-3">
                <Tile label="Healthy vehicles" value={String(138 + summary.healthy)} tone="text-secondary" sub="of 152" />
                <Tile label="Warnings" value={String(summary.warning)} tone="text-amber-300" sub="upcoming service" />
                <Tile label="Critical" value={String(summary.critical)} tone="text-rose-300" sub="action required" />
            </div>

            <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
                <div className="glass rounded-2xl p-5">
                    <h3 className="font-display text-lg font-semibold">Upcoming service alerts</h3>
                    <ul className="mt-3 space-y-2.5">
                        {maintenanceList.map((m) => {
                            const t = toneMap[m.status as keyof typeof toneMap] || toneMap.healthy;
                            const Icon = t.icon;
                            return (
                                <li key={m.id} className={`flex items-center gap-3 rounded-xl border border-border/50 bg-card/40 p-3 ring-1 ${t.ring}`}>
                                    <div className={`grid h-10 w-10 place-items-center rounded-lg ${t.bg} ${t.text}`}><Icon className="h-5 w-5" /></div>
                                    <div className="min-w-0 flex-1">
                                        <div className="text-sm font-medium">{m.task}</div>
                                        <div className="text-xs text-muted-foreground">{m.vehicle} · due {m.due}</div>
                                    </div>
                                    <button className="rounded-md border border-border bg-card/60 px-3 py-1.5 text-xs hover:bg-card">Schedule</button>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                <div className="glass rounded-2xl p-5">
                    <div className="flex items-center gap-2 text-sm text-primary"><CalendarDays className="h-4 w-4" /> Maintenance calendar</div>
                    <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[10px] text-muted-foreground">
                        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <div key={`${d}-${i}`}>{d}</div>)}
                        {Array.from({ length: 35 }).map((_, i) => {
                            const day = i - 2;
                            const has = [4, 7, 11, 12, 18, 22, 28].includes(day);
                            const critical = [11, 22].includes(day);
                            return (
                                <div key={i} className={`aspect-square rounded-md border text-xs font-medium ${day < 1 || day > 30 ? "border-transparent text-muted-foreground/30" : has ? (critical ? "border-rose-400/40 bg-rose-400/10 text-rose-200" : "border-primary/40 bg-primary/10 text-primary") : "border-border/40"}`}>
                                    {day > 0 && day <= 30 ? <div className="grid h-full place-items-center">{day}</div> : null}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="glass rounded-2xl p-5">
                <div className="flex items-center gap-2"><Wrench className="h-4 w-4 text-primary" /><h3 className="font-display text-lg font-semibold">Maintenance timeline</h3></div>
                <ol className="relative mt-4 space-y-4 border-l border-border/60 pl-5">
                    {[
                        { d: "Today", t: "VF-005 battery cooling pump replacement", tone: "text-rose-300" },
                        { d: "Yesterday", t: "VF-003 firmware OTA update v3.4.2", tone: "text-primary" },
                        { d: "3 days ago", t: "VF-001 brake pad inspection passed", tone: "text-secondary" },
                        { d: "1 week ago", t: "VF-008 tire rotation completed", tone: "text-secondary" },
                    ].map((e) => (
                        <li key={e.t} className="relative">
                            <span className={`absolute -left-[26px] top-1.5 h-2.5 w-2.5 rounded-full bg-current ${e.tone}`} />
                            <div className="text-xs uppercase tracking-wider text-muted-foreground">{e.d}</div>
                            <div className="text-sm">{e.t}</div>
                        </li>
                    ))}
                </ol>
            </div>
        </div>
    );
}

function Tile({ label, value, sub, tone }: { label: string; value: string; sub: string; tone: string }) {
    return (
        <div className="glass rounded-2xl p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
            <div className={`mt-2 font-display text-3xl font-semibold ${tone}`}>{value}</div>
            <div className="text-xs text-muted-foreground">{sub}</div>
        </div>
    );
}

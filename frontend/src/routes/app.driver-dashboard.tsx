import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { useAuth } from "@/lib/auth-context";
import {
    Car, Battery, Wrench, AlertTriangle, DollarSign, Zap, ShieldCheck, Activity,
    Route as RouteIcon, Gauge, FileText, Plug,
} from "lucide-react";
import {
    Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart,
    ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis,
} from "recharts";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/app/driver-dashboard")({
    head: () => ({ meta: [{ title: "My Dashboard — VoltFleet AI" }] }),
    component: DriverDashboardPage,
});

const API_BASE = "http://localhost:8000";

interface DriverDashboardData {
    driver: any;
    assigned_vehicle: any;
    maintenance_items: any[];
    violations: any;
    charging_info: any[];
    revenue_monthly: any[];
    speed_series: any[];
    reports: any[];
}

function DriverDashboardPage() {
    const { user, token } = useAuth();
    const [data, setData] = useState<DriverDashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) return;
        fetch(`${API_BASE}/api/drivers/my-dashboard`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((r) => r.json())
            .then(setData)
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

    if (!data) {
        return (
            <div className="flex h-64 flex-col items-center justify-center text-center">
                <AlertTriangle className="h-10 w-10 text-amber-400" />
                <p className="mt-3 text-lg font-semibold">No driver profile linked</p>
                <p className="text-sm text-muted-foreground">Please contact your fleet manager to link your account.</p>
            </div>
        );
    }

    const { driver, assigned_vehicle, maintenance_items, violations, charging_info, revenue_monthly, speed_series, reports } = data;

    return (
        <div className="space-y-6">
            <PageHeader
                title={`Welcome back, ${user?.first_name}`}
                subtitle="Your personal driver dashboard — performance, vehicle, and reports at a glance."
            />

            {/* ── KPI Row ───────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <KpiCard label="Total Trips" value={driver.trips} delta={3.2} icon={RouteIcon} accent="blue" spark={[]} />
                <KpiCard label="Safety Score" value={driver.safety_score} delta={1.1} icon={ShieldCheck} accent="green" spark={[]} />
                <KpiCard label="Total Revenue" value={`$${(driver.revenue / 1000).toFixed(1)}k`} delta={5.4} icon={DollarSign} accent="green" spark={[]} />
                <KpiCard label="AI Score" value={driver.ai_score} delta={0.8} icon={Activity} accent="purple" spark={[]} />
            </div>

            {/* ── Driver Details + Assigned Vehicle ─────────── */}
            <div className="grid gap-4 lg:grid-cols-2">
                {/* Driver Card */}
                <div className="glass rounded-2xl p-6">
                    <h3 className="font-display text-lg font-semibold">Driver Profile</h3>
                    <div className="mt-4 flex items-center gap-4">
                        <div className={`grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br ${driver.avatar_color} font-display text-xl font-semibold text-background shadow-[var(--shadow-glow)]`}>
                            {driver.name.split(" ").map((n: string) => n[0]).join("")}
                        </div>
                        <div>
                            <div className="text-xl font-semibold">{driver.name}</div>
                            <div className="text-sm text-muted-foreground">{driver.group_name} Fleet</div>
                            <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-secondary/15 px-2 py-0.5 text-xs font-medium text-secondary">
                                <Car className="h-3 w-3" /> Driver
                            </div>
                        </div>
                    </div>
                    <div className="mt-5 grid grid-cols-3 gap-3">
                        <StatBox label="Distance" value={`${(driver.distance / 1000).toFixed(1)}k km`} />
                        <StatBox label="Efficiency" value={`${driver.efficiency_score}%`} />
                        <StatBox label="Vehicle" value={driver.vehicle_id || "—"} />
                    </div>
                </div>

                {/* Assigned Vehicle */}
                <div className="glass rounded-2xl p-6">
                    <h3 className="font-display text-lg font-semibold">Assigned Vehicle</h3>
                    {assigned_vehicle ? (
                        <>
                            <div className="mt-4 flex items-center gap-4">
                                <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/10 border border-primary/30">
                                    <Car className="h-8 w-8 text-primary" />
                                </div>
                                <div>
                                    <div className="text-xl font-semibold">{assigned_vehicle.make} {assigned_vehicle.model}</div>
                                    <div className="text-sm text-muted-foreground">{assigned_vehicle.vehicle_id} · {assigned_vehicle.year}</div>
                                    <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${assigned_vehicle.status === "active" ? "bg-secondary/15 text-secondary" : assigned_vehicle.status === "charging" ? "bg-primary/15 text-primary" : "bg-amber-500/15 text-amber-300"}`}>
                                        {assigned_vehicle.status}
                                    </span>
                                </div>
                            </div>
                            <div className="mt-5 grid grid-cols-4 gap-3">
                                <StatBox label="SoC" value={`${assigned_vehicle.soc}%`} />
                                <StatBox label="SoH" value={`${assigned_vehicle.soh}%`} />
                                <StatBox label="Range" value={`${assigned_vehicle.range_miles} mi`} />
                                <StatBox label="Mileage" value={`${(assigned_vehicle.mileage / 1000).toFixed(0)}k`} />
                            </div>
                            {/* Battery bar */}
                            <div className="mt-4">
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>Battery Level</span>
                                    <span className="font-medium text-primary">{assigned_vehicle.soc}%</span>
                                </div>
                                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                                    <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all" style={{ width: `${assigned_vehicle.soc}%` }} />
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="mt-6 text-center text-muted-foreground">No vehicle assigned yet</div>
                    )}
                </div>
            </div>

            {/* ── Violations + Revenue Chart ────────────────── */}
            <div className="grid gap-4 lg:grid-cols-3">
                {/* Violations */}
                <div className="glass rounded-2xl p-5">
                    <h3 className="font-display text-lg font-semibold">Violations</h3>
                    <p className="text-xs text-muted-foreground">Driving behavior incidents</p>
                    <div className="mt-4 space-y-3">
                        <ViolationRow label="Harsh braking" count={violations.harsh_brake} color="text-rose-400" bg="bg-rose-500/15" />
                        <ViolationRow label="Rapid acceleration" count={violations.rapid_accel} color="text-amber-400" bg="bg-amber-500/15" />
                        <ViolationRow label="Overspeeding" count={violations.overspeed} color="text-primary" bg="bg-primary/15" />
                    </div>
                    <div className="mt-4 flex items-center justify-between rounded-lg border border-border/50 bg-card/40 p-3">
                        <span className="text-sm font-medium">Total violations</span>
                        <span className={`font-display text-2xl font-semibold ${violations.total > 8 ? "text-rose-400" : violations.total > 4 ? "text-amber-400" : "text-secondary"}`}>
                            {violations.total}
                        </span>
                    </div>
                </div>

                {/* Revenue Chart */}
                <div className="glass rounded-2xl p-5 lg:col-span-2">
                    <h3 className="font-display text-lg font-semibold">Monthly Revenue</h3>
                    <p className="text-xs text-muted-foreground">Your earnings over the year</p>
                    <div className="mt-4 h-64">
                        <ResponsiveContainer>
                            <BarChart data={revenue_monthly}>
                                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.02 250 / 30%)" />
                                <XAxis dataKey="month" stroke="oklch(0.7 0.02 250)" fontSize={11} />
                                <YAxis stroke="oklch(0.7 0.02 250)" fontSize={11} />
                                <RTooltip contentStyle={{ background: "oklch(0.18 0.025 250)", border: "1px solid oklch(0.3 0.02 250 / 60%)", borderRadius: 8 }} />
                                <Bar dataKey="revenue" fill="oklch(0.78 0.2 160)" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* ── Speed + Charging ──────────────────────────── */}
            <div className="grid gap-4 lg:grid-cols-2">
                {/* Speed chart */}
                <div className="glass rounded-2xl p-5">
                    <h3 className="font-display text-lg font-semibold">Speed Telemetry</h3>
                    <p className="text-xs text-muted-foreground">Recent driving pattern</p>
                    <div className="mt-4 h-56">
                        <ResponsiveContainer>
                            <AreaChart data={speed_series}>
                                <defs>
                                    <linearGradient id="speed-grad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="oklch(0.72 0.18 230)" stopOpacity={0.5} />
                                        <stop offset="100%" stopColor="oklch(0.72 0.18 230)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.02 250 / 30%)" />
                                <XAxis dataKey="t" stroke="oklch(0.7 0.02 250)" fontSize={11} />
                                <YAxis stroke="oklch(0.7 0.02 250)" fontSize={11} />
                                <RTooltip contentStyle={{ background: "oklch(0.18 0.025 250)", border: "1px solid oklch(0.3 0.02 250 / 60%)", borderRadius: 8 }} />
                                <Area type="monotone" dataKey="speed" stroke="oklch(0.72 0.18 230)" fill="url(#speed-grad)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Charging Monitor */}
                <div className="glass rounded-2xl p-5">
                    <h3 className="font-display text-lg font-semibold">Charge Monitoring</h3>
                    <p className="text-xs text-muted-foreground">Scheduled charging for your vehicle</p>
                    {charging_info.length > 0 ? (
                        <div className="mt-4 space-y-2">
                            {charging_info.map((c: any, i: number) => (
                                <div key={i} className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/40 p-3">
                                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                                        <Plug className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium truncate">{c.station}</div>
                                        <div className="text-xs text-muted-foreground">Start: {c.time} · Duration: {c.duration}</div>
                                    </div>
                                    <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary">{c.rate}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="mt-8 text-center text-muted-foreground">
                            <Plug className="mx-auto h-8 w-8 opacity-50" />
                            <p className="mt-2">No charging scheduled</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Maintenance + Reports ────────────────────── */}
            <div className="grid gap-4 lg:grid-cols-2">
                {/* Maintenance */}
                <div className="glass rounded-2xl p-5">
                    <h3 className="font-display text-lg font-semibold">Vehicle Maintenance</h3>
                    <p className="text-xs text-muted-foreground">Upcoming service items for your vehicle</p>
                    {maintenance_items.length > 0 ? (
                        <div className="mt-4 space-y-2">
                            {maintenance_items.map((m: any, i: number) => (
                                <div key={i} className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/40 p-3">
                                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${m.status === "critical" ? "bg-rose-400 animate-pulse" : m.status === "warning" ? "bg-amber-400" : "bg-secondary"}`} />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium">{m.task}</div>
                                        <div className="text-xs text-muted-foreground">{m.vehicle_id} · Due {m.due}</div>
                                    </div>
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${m.status === "critical" ? "bg-rose-500/15 text-rose-300" : m.status === "warning" ? "bg-amber-500/15 text-amber-300" : "bg-secondary/15 text-secondary"}`}>
                                        {m.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="mt-8 text-center text-muted-foreground">
                            <Wrench className="mx-auto h-8 w-8 opacity-50" />
                            <p className="mt-2">No maintenance items pending</p>
                        </div>
                    )}
                </div>

                {/* Reports */}
                <div className="glass rounded-2xl p-5">
                    <h3 className="font-display text-lg font-semibold">Driver Reports</h3>
                    <p className="text-xs text-muted-foreground">Your performance and safety reviews</p>
                    <div className="mt-4 space-y-2">
                        {reports.map((r: any, i: number) => (
                            <div key={i} className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/40 p-3">
                                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium">{r.type}</div>
                                    <div className="text-xs text-muted-foreground">{r.date}</div>
                                </div>
                                <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${r.status === "completed" ? "bg-secondary/15 text-secondary" : "bg-amber-500/15 text-amber-300"}`}>
                                    {r.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatBox({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg border border-border/50 bg-card/40 p-2.5 text-center">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
            <div className="mt-0.5 font-display text-sm font-semibold">{value}</div>
        </div>
    );
}

function ViolationRow({ label, count, color, bg }: { label: string; count: number; color: string; bg: string }) {
    return (
        <div className="flex items-center justify-between rounded-lg border border-border/50 bg-card/40 p-3">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className={`rounded-full px-2.5 py-0.5 font-display text-base font-semibold ${color} ${bg}`}>{count}</span>
        </div>
    );
}

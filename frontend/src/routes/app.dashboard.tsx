import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import {
    Truck, Activity, Plug, PowerOff, HeartPulse, DollarSign, Zap, Battery,
} from "lucide-react";
import {
    Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, Line, LineChart, Pie, PieChart,
    Cell, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis,
} from "recharts";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { kpiTrend } from "@/lib/mock-data";

export const Route = createFileRoute("/app/dashboard")({
    head: () => ({ meta: [{ title: "Dashboard — VoltFleet AI" }] }),
    component: Dashboard,
});

const API_BASE = "http://localhost:8000";
const COLORS = ["oklch(0.78 0.2 160)", "oklch(0.72 0.18 230)", "oklch(0.82 0.17 80)", "oklch(0.65 0.22 25)", "oklch(0.55 0.04 250)"];

function Dashboard() {
    const { token } = useAuth();
    const [kpis, setKpis] = useState<any>({
        total_vehicles: 0,
        active: 0,
        charging: 0,
        offline: 0,
        fleet_health_score: 94,
        revenue_mtd: "$0K",
        energy_today: "0 kWh",
        avg_battery_health: 0,
    });
    const [vehiclesList, setVehiclesList] = useState<any[]>([]);
    const [energyData, setEnergyData] = useState<any[]>([]);
    const [activityData, setActivityData] = useState<any[]>([]);
    const [alertsList, setAlertsList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) return;
        setLoading(true);
        const headers = { Authorization: `Bearer ${token}` };
        
        Promise.all([
            fetch(`${API_BASE}/api/dashboard/kpis`, { headers }).then(r => r.json()),
            fetch(`${API_BASE}/api/vehicles/`, { headers }).then(r => r.json()),
            fetch(`${API_BASE}/api/dashboard/energy-trend`, { headers }).then(r => r.json()),
            fetch(`${API_BASE}/api/dashboard/fleet-activity`, { headers }).then(r => r.json()),
            fetch(`${API_BASE}/api/alerts/`, { headers }).then(r => r.json())
        ])
        .then(([kpisData, vehiclesData, energyTrendData, fleetActivityData, alertsData]) => {
            setKpis(kpisData);
            setVehiclesList(vehiclesData);
            setEnergyData(energyTrendData);
            setActivityData(fleetActivityData);
            
            const mappedAlerts = alertsData.map((a: any) => ({
                id: a.id,
                vehicle: a.vehicle_id,
                type: a.type,
                title: a.title,
                time: a.created_at ? new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"
            }));
            setAlertsList(mappedAlerts);
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

    const active = vehiclesList.filter(v => v.status === "active").length;
    const charging = vehiclesList.filter(v => v.status === "charging").length;
    const offline = vehiclesList.filter(v => v.status === "offline").length;
    const statusDist = [
        { name: "Active", value: active },
        { name: "Charging", value: charging },
        { name: "Garage", value: vehiclesList.filter(v => v.status === "garage").length },
        { name: "Maintenance", value: vehiclesList.filter(v => v.status === "maintenance").length },
        { name: "Offline", value: offline },
    ];

    return (
        <div className="space-y-6">
            <PageHeader title="Fleet command center" subtitle="Real-time KPIs across your electric operations." />

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <KpiCard label="Total Vehicles" value={kpis.total_vehicles} delta={2.4} icon={Truck} accent="blue" spark={kpiTrend(150)} />
                <KpiCard label="Active" value={kpis.active} delta={3.8} icon={Activity} accent="green" spark={kpiTrend(120)} />
                <KpiCard label="Charging" value={kpis.charging} delta={-1.2} icon={Plug} accent="amber" spark={kpiTrend(40)} />
                <KpiCard label="Offline" value={kpis.offline} delta={-12.5} icon={PowerOff} accent="red" spark={kpiTrend(8)} />
                <KpiCard label="Fleet Health Score" value={`${kpis.fleet_health_score} / 100`} delta={1.6} icon={HeartPulse} accent="green" spark={kpiTrend(92)} />
                <KpiCard label="Revenue (MTD)" value={kpis.revenue_mtd} delta={9.1} icon={DollarSign} accent="green" spark={kpiTrend(240)} />
                <KpiCard label="Energy Today" value={kpis.energy_today} delta={4.2} icon={Zap} accent="blue" spark={kpiTrend(4500)} />
                <KpiCard label="Avg Battery Health" value={`${kpis.avg_battery_health}%`} delta={-0.3} icon={Battery} accent="purple" spark={kpiTrend(93)} />
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <div className="glass rounded-2xl p-5 lg:col-span-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-display text-lg font-semibold">Energy consumption</h3>
                            <p className="text-xs text-muted-foreground">Last 24 hours — kWh / cost ($)</p>
                        </div>
                        <div className="flex gap-4 text-xs">
                            <Legend2 color="oklch(0.72 0.18 230)" label="Energy" />
                            <Legend2 color="oklch(0.78 0.2 160)" label="Cost" />
                        </div>
                    </div>
                    <div className="mt-4 h-72">
                        <ResponsiveContainer>
                            <AreaChart data={energyData}>
                                <defs>
                                    <linearGradient id="ed1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="oklch(0.72 0.18 230)" stopOpacity={0.5} /><stop offset="100%" stopColor="oklch(0.72 0.18 230)" stopOpacity={0} /></linearGradient>
                                    <linearGradient id="ed2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="oklch(0.78 0.2 160)" stopOpacity={0.5} /><stop offset="100%" stopColor="oklch(0.78 0.2 160)" stopOpacity={0} /></linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.02 250 / 30%)" />
                                <XAxis dataKey="hour" stroke="oklch(0.7 0.02 250)" fontSize={11} />
                                <YAxis stroke="oklch(0.7 0.02 250)" fontSize={11} />
                                <RTooltip contentStyle={{ background: "oklch(0.18 0.025 250)", border: "1px solid oklch(0.3 0.02 250 / 60%)", borderRadius: 8 }} />
                                <Area type="monotone" dataKey="energy" stroke="oklch(0.72 0.18 230)" strokeWidth={2} fill="url(#ed1)" />
                                <Area type="monotone" dataKey="cost" stroke="oklch(0.78 0.2 160)" strokeWidth={2} fill="url(#ed2)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass rounded-2xl p-5">
                    <h3 className="font-display text-lg font-semibold">Fleet status</h3>
                    <p className="text-xs text-muted-foreground">Live distribution</p>
                    <div className="mt-2 h-64">
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={statusDist} dataKey="value" innerRadius={55} outerRadius={85} paddingAngle={3} stroke="none">
                                    {statusDist.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                                </Pie>
                                <RTooltip contentStyle={{ background: "oklch(0.18 0.025 250)", border: "1px solid oklch(0.3 0.02 250 / 60%)", borderRadius: 8 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        {statusDist.map((s, i) => (
                            <div key={s.name} className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full" style={{ background: COLORS[i] }} />
                                <span className="text-muted-foreground">{s.name}</span>
                                <span className="ml-auto font-medium">{s.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <div className="glass rounded-2xl p-5 lg:col-span-2">
                    <h3 className="font-display text-lg font-semibold">Weekly fleet activity</h3>
                    <p className="text-xs text-muted-foreground">Active vs charging vs offline</p>
                    <div className="mt-4 h-64">
                        <ResponsiveContainer>
                            <BarChart data={activityData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.02 250 / 30%)" />
                                <XAxis dataKey="day" stroke="oklch(0.7 0.02 250)" fontSize={11} />
                                <YAxis stroke="oklch(0.7 0.02 250)" fontSize={11} />
                                <RTooltip contentStyle={{ background: "oklch(0.18 0.025 250)", border: "1px solid oklch(0.3 0.02 250 / 60%)", borderRadius: 8 }} />
                                <Bar dataKey="active" stackId="a" fill="oklch(0.78 0.2 160)" radius={[0, 0, 0, 0]} />
                                <Bar dataKey="charging" stackId="a" fill="oklch(0.72 0.18 230)" />
                                <Bar dataKey="offline" stackId="a" fill="oklch(0.55 0.04 250)" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass rounded-2xl p-5">
                    <h3 className="font-display text-lg font-semibold">Live alerts</h3>
                    <p className="text-xs text-muted-foreground">Streaming from telemetry</p>
                    <ul className="mt-3 space-y-2">
                        {alertsList.slice(0, 6).map((a) => (
                            <li key={a.id} className="flex items-start gap-3 rounded-lg border border-border/50 bg-card/40 p-3">
                                <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${a.type === "critical" ? "bg-rose-400 animate-pulse" : a.type === "warning" ? "bg-amber-400" : "bg-primary"}`} />
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="truncate text-sm font-medium">{a.title}</div>
                                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{a.time}</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground">{a.vehicle}</div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

function Legend2({ color, label }: { color: string; label: string }) {
    return <div className="flex items-center gap-1.5 text-muted-foreground"><span className="h-2 w-2 rounded-full" style={{ background: color }} />{label}</div>;
}

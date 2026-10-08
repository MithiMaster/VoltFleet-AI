import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis } from "recharts";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/app/charging")({
    head: () => ({ meta: [{ title: "Charging Management — VoltFleet AI" }] }),
    component: Charging,
});

const API_BASE = "http://localhost:8000";

function Charging() {
    const { token } = useAuth();
    const [chargingList, setChargingList] = useState<any[]>([]);
    const [energyData, setEnergyData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const monthly = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, i) => ({ m, cost: 8200 + Math.round(Math.sin(i / 2) * 1800 + Math.random() * 600) }));

    useEffect(() => {
        if (!token) return;
        setLoading(true);
        const headers = { Authorization: `Bearer ${token}` };
        Promise.all([
            fetch(`${API_BASE}/api/charging/schedule`, { headers }).then(r => r.json()),
            fetch(`${API_BASE}/api/dashboard/energy-trend`, { headers }).then(r => r.json())
        ])
        .then(([scheduleData, energyTrendData]) => {
            const mapped = scheduleData.map((s: any) => ({
                id: s.id,
                time: s.time,
                station: s.station,
                vehicle: s.vehicle_id,
                duration: s.duration,
                rate: s.rate
            }));
            setChargingList(mapped);
            setEnergyData(energyTrendData);
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

    return (
        <div className="space-y-5">
            <PageHeader title="Charging management" subtitle="Schedule, monitor and optimize fleet charging." />

            <div className="grid gap-4 sm:grid-cols-4">
                <Tile label="Active chargers" value="14 / 22" tone="text-primary" />
                <Tile label="Energy today" value="4,820 kWh" tone="text-secondary" />
                <Tile label="Peak cost" value="$0.34/kWh" tone="text-amber-300" />
                <Tile label="Off-peak savings" value="$1,240" tone="text-secondary" />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <div className="glass rounded-2xl p-5">
                    <h3 className="font-display text-lg font-semibold">Daily charging trends</h3>
                    <div className="mt-3 h-64">
                        <ResponsiveContainer>
                            <AreaChart data={energyData}>
                                <defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="oklch(0.72 0.18 230)" stopOpacity={0.5} /><stop offset="100%" stopColor="oklch(0.72 0.18 230)" stopOpacity={0} /></linearGradient></defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.02 250 / 30%)" />
                                <XAxis dataKey="hour" stroke="oklch(0.7 0.02 250)" fontSize={11} /><YAxis stroke="oklch(0.7 0.02 250)" fontSize={11} />
                                <RTooltip contentStyle={{ background: "oklch(0.18 0.025 250)", border: "1px solid oklch(0.3 0.02 250 / 60%)", borderRadius: 8 }} />
                                <Area type="monotone" dataKey="energy" stroke="oklch(0.72 0.18 230)" fill="url(#cg)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="glass rounded-2xl p-5">
                    <h3 className="font-display text-lg font-semibold">Monthly energy costs</h3>
                    <div className="mt-3 h-64">
                        <ResponsiveContainer>
                            <BarChart data={monthly}>
                                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.02 250 / 30%)" />
                                <XAxis dataKey="m" stroke="oklch(0.7 0.02 250)" fontSize={11} /><YAxis stroke="oklch(0.7 0.02 250)" fontSize={11} />
                                <RTooltip contentStyle={{ background: "oklch(0.18 0.025 250)", border: "1px solid oklch(0.3 0.02 250 / 60%)", borderRadius: 8 }} />
                                <Bar dataKey="cost" fill="oklch(0.78 0.2 160)" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="glass overflow-hidden rounded-2xl">
                <div className="flex items-center justify-between border-b border-border/40 p-4">
                    <h3 className="font-display text-lg font-semibold">Charging schedule (tonight)</h3>
                    <span className="text-xs text-muted-foreground">Optimized for off-peak rates</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-card/40 text-xs uppercase tracking-wider text-muted-foreground">
                            <tr>{["Start", "Station", "Vehicle", "Duration", "Rate"].map(h => <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>)}</tr>
                        </thead>
                        <tbody>
                            {chargingList.map((s) => (
                                <tr key={s.id} className="border-t border-border/40 hover:bg-card/30">
                                    <td className="px-4 py-3 font-medium">{s.time}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{s.station}</td>
                                    <td className="px-4 py-3">{s.vehicle}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{s.duration}</td>
                                    <td className="px-4 py-3"><span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary">{s.rate}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function Tile({ label, value, tone }: { label: string; value: string; tone: string }) {
    return (
        <div className="glass rounded-2xl p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
            <div className={`mt-1.5 font-display text-2xl font-semibold ${tone}`}>{value}</div>
        </div>
    );
}

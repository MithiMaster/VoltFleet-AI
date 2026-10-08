import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { batterySocSeries, sohSeries } from "@/lib/mock-data";
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis } from "recharts";
import { Battery, Thermometer, Zap, Activity, TrendingDown, Clock, Recycle } from "lucide-react";

export const Route = createFileRoute("/app/battery")({
    head: () => ({ meta: [{ title: "Battery Analytics — VoltFleet AI" }] }),
    component: BatteryAnalytics,
});

function BatteryAnalytics() {
    return (
        <div className="space-y-5">
            <PageHeader title="Battery analytics" subtitle="Real-time SoC, SoH, voltage, current and thermal trends." />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Diag icon={Battery} label="Battery SoH" value="93.2%" tone="text-secondary" />
                <Diag icon={Activity} label="Remaining range" value="278 mi" tone="text-primary" />
                <Diag icon={Thermometer} label="Battery temp" value="29 °C" tone="text-amber-300" />
                <Diag icon={Zap} label="Voltage divergence" value="0.04 V" tone="text-primary" />
                <Diag icon={Clock} label="Estimated useful life" value="7.2 yr" tone="text-secondary" />
                <Diag icon={Recycle} label="Charging cycles" value="412" tone="text-primary" />
                <Diag icon={TrendingDown} label="Degradation rate" value="0.8% / yr" tone="text-amber-300" />
                <Diag icon={Activity} label="Internal resistance" value="38 mΩ" tone="text-secondary" />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <Chart title="State of charge (24h)" gradient="oklch(0.72 0.18 230)">
                    <AreaChart data={batterySocSeries}>
                        <defs><linearGradient id="bs1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="oklch(0.72 0.18 230)" stopOpacity={0.5} /><stop offset="100%" stopColor="oklch(0.72 0.18 230)" stopOpacity={0} /></linearGradient></defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.02 250 / 30%)" />
                        <XAxis dataKey="t" stroke="oklch(0.7 0.02 250)" fontSize={11} /><YAxis stroke="oklch(0.7 0.02 250)" fontSize={11} />
                        <RTooltip contentStyle={{ background: "oklch(0.18 0.025 250)", border: "1px solid oklch(0.3 0.02 250 / 60%)", borderRadius: 8 }} />
                        <Area dataKey="soc" stroke="oklch(0.72 0.18 230)" fill="url(#bs1)" strokeWidth={2} />
                    </AreaChart>
                </Chart>
                <Chart title="Battery health (12 mo)" gradient="oklch(0.78 0.2 160)">
                    <LineChart data={sohSeries}>
                        <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.02 250 / 30%)" />
                        <XAxis dataKey="month" stroke="oklch(0.7 0.02 250)" fontSize={11} /><YAxis domain={[90, 100]} stroke="oklch(0.7 0.02 250)" fontSize={11} />
                        <RTooltip contentStyle={{ background: "oklch(0.18 0.025 250)", border: "1px solid oklch(0.3 0.02 250 / 60%)", borderRadius: 8 }} />
                        <Line type="monotone" dataKey="soh" stroke="oklch(0.78 0.2 160)" strokeWidth={2} dot={{ r: 3, fill: "oklch(0.78 0.2 160)" }} />
                    </LineChart>
                </Chart>
                <Chart title="Temperature trend" gradient="oklch(0.82 0.17 80)">
                    <AreaChart data={batterySocSeries}>
                        <defs><linearGradient id="bs2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="oklch(0.82 0.17 80)" stopOpacity={0.5} /><stop offset="100%" stopColor="oklch(0.82 0.17 80)" stopOpacity={0} /></linearGradient></defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.02 250 / 30%)" />
                        <XAxis dataKey="t" stroke="oklch(0.7 0.02 250)" fontSize={11} /><YAxis stroke="oklch(0.7 0.02 250)" fontSize={11} />
                        <RTooltip contentStyle={{ background: "oklch(0.18 0.025 250)", border: "1px solid oklch(0.3 0.02 250 / 60%)", borderRadius: 8 }} />
                        <Area dataKey="temp" stroke="oklch(0.82 0.17 80)" fill="url(#bs2)" strokeWidth={2} />
                    </AreaChart>
                </Chart>
                <Chart title="Voltage & current" gradient="oklch(0.7 0.18 300)">
                    <LineChart data={batterySocSeries}>
                        <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.02 250 / 30%)" />
                        <XAxis dataKey="t" stroke="oklch(0.7 0.02 250)" fontSize={11} /><YAxis stroke="oklch(0.7 0.02 250)" fontSize={11} />
                        <RTooltip contentStyle={{ background: "oklch(0.18 0.025 250)", border: "1px solid oklch(0.3 0.02 250 / 60%)", borderRadius: 8 }} />
                        <Line type="monotone" dataKey="voltage" stroke="oklch(0.7 0.18 300)" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="current" stroke="oklch(0.78 0.2 160)" strokeWidth={2} dot={false} />
                    </LineChart>
                </Chart>
            </div>
        </div>
    );
}

function Diag({ icon: Icon, label, value, tone }: { icon: React.ElementType; label: string; value: string; tone: string }) {
    return (
        <div className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground"><span>{label}</span><Icon className="h-4 w-4" /></div>
            <div className={`mt-2 font-display text-2xl font-semibold ${tone}`}>{value}</div>
        </div>
    );
}
function Chart({ title, children }: { title: string; gradient: string; children: React.ReactElement }) {
    return (
        <div className="glass rounded-2xl p-5">
            <h3 className="font-display text-lg font-semibold">{title}</h3>
            <div className="mt-3 h-60"><ResponsiveContainer>{children}</ResponsiveContainer></div>
        </div>
    );
}

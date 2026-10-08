import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

interface KpiCardProps {
    label: string;
    value: string | number;
    delta?: number;
    icon: LucideIcon;
    accent?: "blue" | "green" | "amber" | "red" | "purple";
    spark?: number[];
}

const accents: Record<string, string> = {
    blue: "from-primary/30 to-primary/0 text-primary",
    green: "from-secondary/30 to-secondary/0 text-secondary",
    amber: "from-amber-400/30 to-amber-400/0 text-amber-300",
    red: "from-rose-500/30 to-rose-500/0 text-rose-300",
    purple: "from-fuchsia-500/30 to-fuchsia-500/0 text-fuchsia-300",
};

export function KpiCard({ label, value, delta, icon: Icon, accent = "blue", spark }: KpiCardProps) {
    const up = (delta ?? 0) >= 0;
    const data = (spark ?? [4, 8, 6, 12, 9, 14, 11, 16, 13, 18, 15, 22]).map((v, i) => ({ i, v }));
    return (
        <div className="group relative overflow-hidden rounded-2xl glass p-5 transition-all hover:translate-y-[-2px] hover:shadow-[var(--shadow-glow)]">
            <div className={cn("pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-radial blur-2xl opacity-60 bg-gradient-to-br", accents[accent])} />
            <div className="relative flex items-start justify-between">
                <div>
                    <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
                    <div className="mt-2 font-display text-3xl font-semibold tracking-tight">{value}</div>
                    {typeof delta === "number" && (
                        <div className={cn("mt-1.5 inline-flex items-center gap-1 text-xs font-medium",
                            up ? "text-secondary" : "text-rose-400")}>
                            {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                            {Math.abs(delta)}% vs last week
                        </div>
                    )}
                </div>
                <div className={cn("grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br", accents[accent])}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>
            <div className="mt-3 h-12 -mx-1 opacity-90">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id={`g-${label}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="currentColor" stopOpacity={0.5} />
                                <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="v" stroke="currentColor" strokeWidth={2} fill={`url(#g-${label})`} className={accents[accent].split(" ").pop()} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

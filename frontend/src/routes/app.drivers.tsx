import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Line, LineChart, ResponsiveContainer, Tooltip as RTooltip, CartesianGrid, XAxis, YAxis, Legend } from "recharts";
import { 
    Route as RouteIcon, 
    Activity, 
    DollarSign, 
    ShieldCheck, 
    Sparkles, 
    Search, 
    Filter, 
    ArrowUpDown, 
    Gauge, 
    BatteryCharging, 
    MapPin, 
    CheckCircle2, 
    AlertCircle, 
    ChevronRight, 
    TrendingUp, 
    Zap 
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/app/drivers")({
    head: () => ({ meta: [{ title: "Drivers — VoltFleet AI" }] }),
    component: DriversPage,
});

const API_BASE = "http://localhost:8000";

function getScoreBadge(score: number) {
    if (score >= 90) return { label: "Elite Operator", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" };
    if (score >= 80) return { label: "Proficient", color: "text-sky-400", bg: "bg-sky-500/10 border-sky-500/30" };
    if (score >= 70) return { label: "Standard", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30" };
    return { label: "Needs Coaching", color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/30" };
}

function DriversPage() {
    const { token } = useAuth();
    const [driversList, setDriversList] = useState<any[]>([]);
    const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
    const [telemetrySeries, setTelemetrySeries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [telemetryLoading, setTelemetryLoading] = useState(false);
    
    // Filter & Search states
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedGroup, setSelectedGroup] = useState<string>("all");
    const [sortBy, setSortBy] = useState<string>("ai_desc");

    // Fetch initial drivers list
    useEffect(() => {
        if (!token) return;
        setLoading(true);
        const headers = { Authorization: `Bearer ${token}` };
        
        fetch(`${API_BASE}/api/drivers/`, { headers })
            .then(r => r.json())
            .then((driversData: any[]) => {
                if (Array.isArray(driversData)) {
                    const mapped = driversData.map((d: any) => ({
                        id: d.driver_id,
                        name: d.name,
                        firstName: d.first_name,
                        lastName: d.last_name,
                        email: d.email,
                        avatarColor: d.avatar_color || "from-sky-500 to-emerald-500",
                        group: d.group_name || "General",
                        trips: d.trips || 0,
                        distance: d.distance || 0,
                        revenue: d.revenue || 0,
                        safetyScore: d.safety_score || 80,
                        efficiencyScore: d.efficiency_score || 80,
                        batteryFriendly: d.battery_friendly || 80,
                        routeCompliance: d.route_compliance || 85,
                        aiScore: d.ai_score || 80,
                        dailyDistanceKm: d.daily_distance_km || 0,
                        avgSpeed: d.avg_speed || 0,
                        endOfDayCharge: d.end_of_day_charge || 50,
                        dailyIncome: d.daily_income || 0,
                        maintenanceCharges: d.maintenance_charges || 0,
                        recommendations: d.recommendations || [],
                        speedSparkline: d.speed_sparkline || [],
                        violationsHarshBrake: d.violations_harsh_brake || 0,
                        violationsRapidAccel: d.violations_rapid_accel || 0,
                        violationsOverspeed: d.violations_overspeed || 0,
                        isActive: d.is_active,
                        isVerified: d.is_verified
                    }));
                    setDriversList(mapped);
                    if (mapped.length > 0 && !selectedDriverId) {
                        setSelectedDriverId(mapped[0].id);
                    }
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [token]);

    // Fetch dynamic telemetry speed series whenever selected driver changes
    useEffect(() => {
        if (!token || !selectedDriverId) return;
        setTelemetryLoading(true);
        const headers = { Authorization: `Bearer ${token}` };

        fetch(`${API_BASE}/api/drivers/${selectedDriverId}/speed-series`, { headers })
            .then(r => r.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    setTelemetrySeries(data);
                } else {
                    // Fallback to driver's sparkline if endpoint returns empty
                    const curr = driversList.find(d => d.id === selectedDriverId);
                    if (curr && curr.speedSparkline?.length > 0) {
                        setTelemetrySeries(curr.speedSparkline.map((s: any, idx: number) => ({
                            t: s.t,
                            speed: s.speed,
                            eff: Math.max(50, Math.min(98, 90 - (s.speed - 50) * 0.4)),
                            power_kw: Math.round(25 + (s.speed / 80) * 30),
                            soc: Math.max(20, 75 - idx * 2)
                        })));
                    }
                }
            })
            .catch(console.error)
            .finally(() => setTelemetryLoading(false));
    }, [token, selectedDriverId, driversList]);

    // Compute top fleet stats
    const fleetStats = useMemo(() => {
        if (driversList.length === 0) return { avgAi: "0", avgSafety: "0", totalTrips: 0, totalRev: 0, topDriver: null };
        const avgAi = (driversList.reduce((acc, d) => acc + d.aiScore, 0) / driversList.length).toFixed(1);
        const avgSafety = (driversList.reduce((acc, d) => acc + d.safetyScore, 0) / driversList.length).toFixed(1);
        const totalTrips = driversList.reduce((acc, d) => acc + d.trips, 0);
        const totalRev = driversList.reduce((acc, d) => acc + d.revenue, 0);
        const topDriver = [...driversList].sort((a, b) => b.aiScore - a.aiScore)[0];
        return { avgAi, avgSafety, totalTrips, totalRev, topDriver };
    }, [driversList]);

    // Extract available groups
    const availableGroups = useMemo(() => {
        const set = new Set<string>();
        driversList.forEach(d => { if (d.group) set.add(d.group); });
        return ["all", ...Array.from(set)];
    }, [driversList]);

    // Filter and sort drivers
    const filteredDrivers = useMemo(() => {
        return driversList.filter(d => {
            const q = searchQuery.toLowerCase().trim();
            const matchesSearch = !q || 
                d.name.toLowerCase().includes(q) || 
                d.email.toLowerCase().includes(q) || 
                d.id.toLowerCase().includes(q) ||
                d.group.toLowerCase().includes(q);
            const matchesGroup = selectedGroup === "all" || d.group === selectedGroup;
            return matchesSearch && matchesGroup;
        }).sort((a, b) => {
            if (sortBy === "ai_desc") return b.aiScore - a.aiScore;
            if (sortBy === "ai_asc") return a.aiScore - b.aiScore;
            if (sortBy === "safety_desc") return b.safetyScore - a.safetyScore;
            if (sortBy === "trips_desc") return b.trips - a.trips;
            if (sortBy === "revenue_desc") return b.revenue - a.revenue;
            if (sortBy === "name_asc") return a.name.localeCompare(b.name);
            return 0;
        });
    }, [driversList, searchQuery, selectedGroup, sortBy]);

    const selectedDriver = driversList.find(d => d.id === selectedDriverId) || filteredDrivers[0] || driversList[0];

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-9 w-9 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span className="text-xs text-muted-foreground animate-pulse">Synchronizing driver ML telemetry...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader 
                title="Drivers & Operator Telemetry" 
                subtitle="Real-time ML driver performance scoring, safety diagnostics, and individual telemetry curves." 
            />

            {/* Fleet KPI Summary Header */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
                <div className="glass rounded-xl p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Fleet Avg AI Score</span>
                        <Sparkles className="h-4 w-4 text-secondary" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="font-display text-3xl font-bold gradient-text">{fleetStats.avgAi}</span>
                        <span className="text-xs text-muted-foreground">/ 100</span>
                    </div>
                    <div className="mt-1 text-[11px] text-muted-foreground">Synchronized with ML Scoring Model</div>
                </div>

                <div className="glass rounded-xl p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Fleet Safety Index</span>
                        <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="font-display text-3xl font-bold text-emerald-400">{fleetStats.avgSafety}</span>
                        <span className="text-xs text-muted-foreground">/ 100</span>
                    </div>
                    <div className="mt-1 text-[11px] text-emerald-500/80">Low incident baseline</div>
                </div>

                <div className="glass rounded-xl p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Total Monitored Trips</span>
                        <RouteIcon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="font-display text-3xl font-bold text-foreground">{fleetStats.totalTrips.toLocaleString()}</span>
                        <span className="text-xs text-muted-foreground">trips</span>
                    </div>
                    <div className="mt-1 text-[11px] text-muted-foreground">{driversList.length} active operators</div>
                </div>

                <div className="glass rounded-xl p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Total Operator Revenue</span>
                        <DollarSign className="h-4 w-4 text-amber-400" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="font-display text-3xl font-bold text-amber-400">
                            ${(fleetStats.totalRev / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })}k
                        </span>
                    </div>
                    <div className="mt-1 text-[11px] text-muted-foreground">
                        Top: {fleetStats.topDriver?.name || "N/A"} ({fleetStats.topDriver?.aiScore || 0})
                    </div>
                </div>
            </div>

            {/* Filter, Search & Controls Strip */}
            <div className="glass rounded-xl p-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input 
                        type="text"
                        placeholder="Search operator, ID, group..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-background/50 border border-border/60 rounded-lg pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-background/40 border border-border/40 rounded-lg px-2.5 py-1">
                        <Filter className="h-3.5 w-3.5" />
                        <span>Group:</span>
                        <select 
                            value={selectedGroup} 
                            onChange={(e) => setSelectedGroup(e.target.value)}
                            className="bg-transparent text-xs text-foreground font-medium focus:outline-none capitalize"
                        >
                            {availableGroups.map(g => (
                                <option key={g} value={g} className="bg-card text-foreground">
                                    {g === "all" ? "All Groups" : `${g} Fleet`}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-background/40 border border-border/40 rounded-lg px-2.5 py-1">
                        <ArrowUpDown className="h-3.5 w-3.5" />
                        <span>Sort:</span>
                        <select 
                            value={sortBy} 
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-transparent text-xs text-foreground font-medium focus:outline-none"
                        >
                            <option value="ai_desc" className="bg-card text-foreground">AI Score (Highest)</option>
                            <option value="ai_asc" className="bg-card text-foreground">AI Score (Lowest)</option>
                            <option value="safety_desc" className="bg-card text-foreground">Safety Rating</option>
                            <option value="trips_desc" className="bg-card text-foreground">Most Trips</option>
                            <option value="revenue_desc" className="bg-card text-foreground">Highest Revenue</option>
                            <option value="name_asc" className="bg-card text-foreground">Name (A-Z)</option>
                        </select>
                    </div>

                    <Link 
                        to="/app/ai-scoring"
                        className="flex items-center gap-1.5 bg-secondary/15 hover:bg-secondary/25 border border-secondary/30 text-secondary text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ml-auto sm:ml-0"
                    >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>AI Simulator</span>
                    </Link>
                </div>
            </div>

            {/* Drivers Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredDrivers.map((d) => {
                    const isSelected = selectedDriver?.id === d.id;
                    const badge = getScoreBadge(d.aiScore);

                    return (
                        <div 
                            key={d.id} 
                            onClick={() => setSelectedDriverId(d.id)}
                            className={`group glass rounded-2xl p-5 transition-all duration-200 cursor-pointer relative overflow-hidden ${
                                isSelected 
                                    ? "border-primary ring-2 ring-primary/40 shadow-[0_0_25px_rgba(56,189,248,0.18)] translate-y-[-2px]" 
                                    : "hover:border-primary/40 hover:translate-y-[-2px]"
                            }`}
                        >
                            {/* Selection Glow Indicator */}
                            {isSelected && (
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary" />
                            )}

                            {/* Header row */}
                            <div className="flex items-center gap-3">
                                <div className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${d.avatarColor} font-display text-base font-semibold text-white shadow-md flex-shrink-0`}>
                                    {d.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5">
                                        <div className="font-semibold truncate">{d.name}</div>
                                        <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                                    </div>
                                    <div className="text-xs text-muted-foreground truncate">{d.group} Fleet • {d.id}</div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">AI Score</div>
                                    <div className="flex items-baseline justify-end gap-1">
                                        <span className="font-display text-2xl font-bold gradient-text">{d.aiScore}</span>
                                    </div>
                                    <div className={`mt-0.5 inline-block text-[9px] px-1.5 py-0.5 rounded border font-semibold ${badge.bg} ${badge.color}`}>
                                        {badge.label}
                                    </div>
                                </div>
                            </div>

                            {/* 4 Performance KPI stats */}
                            <div className="mt-4 grid grid-cols-4 gap-2 text-xs">
                                <Stat icon={RouteIcon} label="Trips" value={d.trips} />
                                <Stat icon={Activity} label="Dist" value={`${(d.distance / 1000).toFixed(0)}km`} />
                                <Stat icon={DollarSign} label="Rev" value={`$${d.revenue >= 1000 ? (d.revenue / 1000).toFixed(1) + 'k' : d.revenue.toFixed(0)}`} />
                                <Stat icon={ShieldCheck} label="Safety" value={`${d.safetyScore}`} />
                            </div>

                            {/* Unique driver sparkline */}
                            <div className="mt-3.5 h-16 w-full rounded-lg bg-card/25 p-1.5 border border-border/30">
                                <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1 px-1">
                                    <span>Telemetry Speed Trend</span>
                                    <span className="font-medium text-foreground">{d.avgSpeed || 60} km/h avg</span>
                                </div>
                                <ResponsiveContainer width="100%" height={38}>
                                    <LineChart data={d.speedSparkline?.length > 0 ? d.speedSparkline : [{ t: '0m', speed: 50 }, { t: '5m', speed: 55 }]}>
                                        <Line 
                                            type="monotone" 
                                            dataKey="speed" 
                                            stroke={d.aiScore >= 90 ? "oklch(0.78 0.2 160)" : d.aiScore >= 80 ? "oklch(0.72 0.18 230)" : "oklch(0.82 0.17 80)"} 
                                            strokeWidth={2} 
                                            dot={false} 
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Violations count */}
                            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                                <Event label="Harsh brake" v={d.violationsHarshBrake} tone={d.violationsHarshBrake > 4 ? "text-rose-400 font-semibold" : "text-foreground"} />
                                <Event label="Rapid accel" v={d.violationsRapidAccel} tone={d.violationsRapidAccel > 4 ? "text-amber-400 font-semibold" : "text-foreground"} />
                                <Event label="Overspeed" v={d.violationsOverspeed} tone={d.violationsOverspeed > 0 ? "text-rose-400 font-semibold" : "text-emerald-400"} />
                            </div>

                            {/* Card footer indicator */}
                            <div className="mt-3 pt-2 border-t border-border/30 flex items-center justify-between text-[11px] text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <span className={`h-1.5 w-1.5 rounded-full ${isSelected ? "bg-primary animate-ping" : "bg-emerald-500"}`} />
                                    {isSelected ? "Active Telemetry View" : "Click to view diagnostics"}
                                </span>
                                <ChevronRight className={`h-3.5 w-3.5 transition-transform ${isSelected ? "text-primary translate-x-0.5" : "text-muted-foreground"}`} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Selected Driver Detailed Telemetry & Diagnostics Panel */}
            {selectedDriver && (
                <div className="glass rounded-2xl p-6 space-y-6 border border-border/70 shadow-lg">
                    {/* Panel Header */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-4">
                        <div className="flex items-center gap-3">
                            <div className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${selectedDriver.avatarColor} font-display text-base font-semibold text-white shadow-md`}>
                                {selectedDriver.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-display text-xl font-bold text-foreground">
                                        Telemetry & ML Diagnostics — {selectedDriver.name}
                                    </h3>
                                    <span className="text-xs bg-primary/10 border border-primary/20 text-primary font-medium px-2 py-0.5 rounded-full">
                                        {selectedDriver.id}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {selectedDriver.group} Fleet • Email: {selectedDriver.email} • Daily Distance: {selectedDriver.dailyDistanceKm} km • Avg Speed: {selectedDriver.avgSpeed} km/h
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-center">
                            <div className="text-right">
                                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Synchronized AI Score</div>
                                <div className="font-display text-2xl font-bold gradient-text">{selectedDriver.aiScore} / 100</div>
                            </div>
                            <Link 
                                to="/app/ai-scoring"
                                className="flex items-center gap-1.5 rounded-lg bg-primary/20 hover:bg-primary/30 border border-primary/40 px-3.5 py-2 text-xs font-semibold text-foreground transition-all"
                            >
                                <Sparkles className="h-4 w-4 text-primary" />
                                <span>Open in AI Driver Scoring</span>
                            </Link>
                        </div>
                    </div>

                    {/* 4 AI Pillar Breakdown Cards (Safety, Efficiency, Battery Friendly, Route Compliance) */}
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <ScorePillar 
                            label="Safety Index" 
                            score={selectedDriver.safetyScore} 
                            icon={ShieldCheck} 
                            color="text-emerald-400" 
                            barColor="bg-emerald-500"
                            desc="Low harsh braking & overspeeding"
                        />
                        <ScorePillar 
                            label="Energy Efficiency" 
                            score={selectedDriver.efficiencyScore} 
                            icon={Gauge} 
                            color="text-sky-400" 
                            barColor="bg-sky-500"
                            desc="Optimized Wh/km consumption"
                        />
                        <ScorePillar 
                            label="Battery Care" 
                            score={selectedDriver.batteryFriendly} 
                            icon={BatteryCharging} 
                            color="text-amber-400" 
                            barColor="bg-amber-500"
                            desc={`End-of-day SOC: ${selectedDriver.endOfDayCharge}%`}
                        />
                        <ScorePillar 
                            label="Route Compliance" 
                            score={selectedDriver.routeCompliance} 
                            icon={MapPin} 
                            color="text-purple-400" 
                            barColor="bg-purple-500"
                            desc="Adherence to planned paths"
                        />
                    </div>

                    {/* Dynamic Dual-Line Telemetry Chart */}
                    <div className="rounded-xl border border-border/40 bg-card/30 p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                            <div>
                                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <Activity className="h-4 w-4 text-primary" />
                                    Multi-Dimensional Telemetry Stream
                                </h4>
                                <span className="text-xs text-muted-foreground">
                                    Real-time speed (km/h) vs Energy Efficiency (%) vs Motor Power Draw (kW)
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs">
                                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[oklch(0.72_0.18_230)]" /> Speed (km/h)</span>
                                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[oklch(0.78_0.2_160)]" /> Efficiency (%)</span>
                                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[oklch(0.82_0.17_80)]" /> Power (kW)</span>
                            </div>
                        </div>

                        <div className="h-64 w-full">
                            {telemetryLoading ? (
                                <div className="h-full flex items-center justify-center">
                                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={telemetrySeries}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.02 250 / 30%)" />
                                        <XAxis dataKey="t" stroke="oklch(0.7 0.02 250)" fontSize={11} />
                                        <YAxis stroke="oklch(0.7 0.02 250)" fontSize={11} domain={[0, 110]} />
                                        <RTooltip 
                                            contentStyle={{ 
                                                background: "oklch(0.18 0.025 250)", 
                                                border: "1px solid oklch(0.3 0.02 250 / 60%)", 
                                                borderRadius: 8,
                                                fontSize: 12
                                            }} 
                                            formatter={(value: any, name: string) => {
                                                if (name === "speed") return [`${value} km/h`, "Speed"];
                                                if (name === "eff") return [`${value}%`, "Efficiency"];
                                                if (name === "power_kw") return [`${value} kW`, "Motor Power"];
                                                return [value, name];
                                            }}
                                        />
                                        <Line 
                                            type="monotone" 
                                            dataKey="speed" 
                                            name="speed"
                                            stroke="oklch(0.72 0.18 230)" 
                                            strokeWidth={2.5} 
                                            dot={{ r: 2 }} 
                                            activeDot={{ r: 5 }}
                                        />
                                        <Line 
                                            type="monotone" 
                                            dataKey="eff" 
                                            name="eff"
                                            stroke="oklch(0.78 0.2 160)" 
                                            strokeWidth={2} 
                                            strokeDasharray="4 2"
                                            dot={false} 
                                        />
                                        <Line 
                                            type="monotone" 
                                            dataKey="power_kw" 
                                            name="power_kw"
                                            stroke="oklch(0.82 0.17 80)" 
                                            strokeWidth={1.5} 
                                            dot={false} 
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    {/* Operational Telemetry Metrics & Personalized AI Coaching Recommendations */}
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Daily Telemetry Metrics */}
                        <div className="rounded-xl border border-border/40 bg-card/30 p-4 space-y-3">
                            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-primary" />
                                Model Feature Inputs for {selectedDriver.name}
                            </h4>
                            <div className="grid grid-cols-2 gap-2.5 text-xs">
                                <div className="p-2.5 rounded-lg bg-background/50 border border-border/40">
                                    <span className="text-muted-foreground">Daily Distance</span>
                                    <div className="text-base font-bold text-foreground mt-0.5">{selectedDriver.dailyDistanceKm} km</div>
                                    <div className="text-[10px] text-muted-foreground">Total: {(selectedDriver.distance / 1000).toFixed(0)} km</div>
                                </div>
                                <div className="p-2.5 rounded-lg bg-background/50 border border-border/40">
                                    <span className="text-muted-foreground">Average Speed</span>
                                    <div className="text-base font-bold text-foreground mt-0.5">{selectedDriver.avgSpeed} km/h</div>
                                    <div className="text-[10px] text-muted-foreground">Target: 55-65 km/h</div>
                                </div>
                                <div className="p-2.5 rounded-lg bg-background/50 border border-border/40">
                                    <span className="text-muted-foreground">Daily Income</span>
                                    <div className="text-base font-bold text-emerald-400 mt-0.5">${selectedDriver.dailyIncome}</div>
                                    <div className="text-[10px] text-muted-foreground">Total: ${selectedDriver.revenue.toFixed(0)}</div>
                                </div>
                                <div className="p-2.5 rounded-lg bg-background/50 border border-border/40">
                                    <span className="text-muted-foreground">Maint. Charges</span>
                                    <div className="text-base font-bold text-amber-400 mt-0.5">${selectedDriver.maintenanceCharges} /day</div>
                                    <div className="text-[10px] text-muted-foreground">Wear & tear impact</div>
                                </div>
                            </div>
                        </div>

                        {/* Personalized AI Coaching Recommendations */}
                        <div className="rounded-xl border border-border/40 bg-card/30 p-4 space-y-3">
                            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-secondary" />
                                Personalized AI Coaching Recommendations
                            </h4>
                            <div className="space-y-2">
                                {selectedDriver.recommendations && selectedDriver.recommendations.length > 0 ? (
                                    selectedDriver.recommendations.map((rec: string, idx: number) => (
                                        <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-background/50 border border-border/40 text-xs">
                                            <Zap className="h-4 w-4 text-secondary flex-shrink-0 mt-0.5" />
                                            <span className="text-foreground/90 leading-relaxed">{rec}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-3 rounded-lg bg-background/50 border border-border/40 text-xs text-muted-foreground">
                                        No violations detected. Operator operating at peak efficiency.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function ScorePillar({ 
    label, 
    score, 
    icon: Icon, 
    color, 
    barColor, 
    desc 
}: { 
    label: string; 
    score: number; 
    icon: React.ElementType; 
    color: string; 
    barColor: string; 
    desc: string; 
}) {
    return (
        <div className="rounded-xl border border-border/40 bg-card/30 p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><Icon className={`h-3.5 w-3.5 ${color}`} /> {label}</span>
                <span className={`font-bold text-sm ${color}`}>{score}/100</span>
            </div>
            <div className="mt-2.5 h-1.5 w-full bg-border/40 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${barColor}`} style={{ width: `${Math.min(100, Math.max(0, score))}%` }} />
            </div>
            <div className="mt-2 text-[10px] text-muted-foreground truncate">{desc}</div>
        </div>
    );
}

function Stat({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
    return (
        <div className="rounded-lg border border-border/50 bg-card/40 p-2">
            <div className="flex items-center gap-1 text-muted-foreground"><Icon className="h-3 w-3" />{label}</div>
            <div className="mt-0.5 font-semibold truncate">{value}</div>
        </div>
    );
}

function Event({ label, v, tone }: { label: string; v: number; tone: string }) {
    return (
        <div className="rounded-md bg-card/40 py-1.5">
            <div className={`font-display text-base ${tone}`}>{v}</div>
            <div className="text-[10px] text-muted-foreground">{label}</div>
        </div>
    );
}

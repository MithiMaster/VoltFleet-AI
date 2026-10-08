import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from "recharts";
import { Sparkles, ShieldCheck, Gauge, BatteryCharging, MapPin, User, ChevronRight, Sliders, ArrowUpRight, ArrowDownRight, RefreshCw, AlertTriangle, CheckCircle, Car } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/app/ai-scoring")({
    head: () => ({ meta: [{ title: "AI Driver Scoring & Prediction — VoltFleet AI" }] }),
    component: AIScoring,
});

const API_BASE = "http://localhost:8000";

const VEHICLE_PRESETS = [
    { name: "Tata Punch EV", battery_capacity_kwh: 40.0 },
    { name: "Tata Curvv EV", battery_capacity_kwh: 55.0 },
    { name: "MG ZS EV", battery_capacity_kwh: 50.3 },
    { name: "Mahindra BE 6", battery_capacity_kwh: 59.0 },
    { name: "MG Windsor EV", battery_capacity_kwh: 52.9 },
    { name: "Tata Harrier EV", battery_capacity_kwh: 75.0 },
    { name: "MG Comet EV", battery_capacity_kwh: 17.3 }
];

function AIScoring() {
    const { token } = useAuth();
    
    // Tab state: "dashboard" | "simulator" | "range_estimator"
    const [activeTab, setActiveTab] = useState<"dashboard" | "simulator" | "range_estimator">("dashboard");

    // Dashboard states
    const [driversList, setDriversList] = useState<any[]>([]);
    const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Simulator states
    const [simDailyDistance, setSimDailyDistance] = useState(120);
    const [simAvgSpeed, setSimAvgSpeed] = useState(65);
    const [simHarshBraking, setSimHarshBraking] = useState(1.5);
    const [simHarshAcceleration, setSimHarshAcceleration] = useState(1.5);
    const [simEndOfDayCharge, setSimEndOfDayCharge] = useState(55);
    const [simDailyIncome, setSimDailyIncome] = useState(250);
    const [simMaintCharges, setSimMaintCharges] = useState(5);
    const [simulatedScore, setSimulatedScore] = useState<number | null>(null);
    const [simLoading, setSimLoading] = useState(false);

    // Range Estimator states
    const [rangeVehicle, setRangeVehicle] = useState(VEHICLE_PRESETS[0]);
    const [rangeBatterySoc, setRangeBatterySoc] = useState(75);
    const [rangeDistance, setRangeDistance] = useState(120);
    const [rangeSpeed, setRangeSpeed] = useState(70);
    const [rangeTemp, setRangeTemp] = useState(30);
    const [rangeElevation, setRangeElevation] = useState(150);
    const [rangeRouteType, setRangeRouteType] = useState("City");
    const [rangeAcStatus, setRangeAcStatus] = useState(1);
    const [predictedRange, setPredictedRange] = useState<number | null>(null);
    const [rangeLoading, setRangeLoading] = useState(false);

    useEffect(() => {
        if (!token) return;
        setLoading(true);
        fetch(`${API_BASE}/api/analytics/driver-performance`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(r => r.json())
        .then(data => {
            setDriversList(data);
            if (data && data.length > 0) {
                setSelectedDriverId(data[0].id);
            }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }, [token]);

    // Debounced simulator score calculation
    useEffect(() => {
        if (!token || activeTab !== "simulator") return;

        const delayDebounce = setTimeout(() => {
            setSimLoading(true);
            fetch(`${API_BASE}/api/analytics/predict`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    daily_distance_km: Number(simDailyDistance),
                    average_speed_kmh: Number(simAvgSpeed),
                    harsh_braking_instances: Number(simHarshBraking),
                    harsh_acceleration_instances: Number(simHarshAcceleration),
                    end_of_day_charge_percentage: Number(simEndOfDayCharge),
                    daily_income: Number(simDailyIncome),
                    maintenance_charges: Number(simMaintCharges)
                })
            })
            .then(r => r.json())
            .then(data => {
                if (data && typeof data.score === "number") {
                    setSimulatedScore(data.score);
                }
            })
            .catch(console.error)
            .finally(() => setSimLoading(false));
        }, 200);

        return () => clearTimeout(delayDebounce);
    }, [
        token,
        activeTab,
        simDailyDistance,
        simAvgSpeed,
        simHarshBraking,
        simHarshAcceleration,
        simEndOfDayCharge,
        simDailyIncome,
        simMaintCharges
    ]);

    // Debounced range prediction calculation
    useEffect(() => {
        if (!token || activeTab !== "range_estimator") return;

        const delayDebounce = setTimeout(() => {
            setRangeLoading(true);
            fetch(`${API_BASE}/api/analytics/predict-range`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    current_battery_pct: Number(rangeBatterySoc),
                    distance_to_destination_km: Number(rangeDistance),
                    current_speed_kmh: Number(rangeSpeed),
                    ac_status: Number(rangeAcStatus),
                    outside_temperature_c: Number(rangeTemp),
                    route_type: rangeRouteType,
                    elevation_ahead: Number(rangeElevation),
                    battery_capacity_kwh: Number(rangeVehicle.battery_capacity_kwh)
                })
            })
            .then(r => r.json())
            .then(data => {
                if (data && typeof data.predicted_range_km === "number") {
                    setPredictedRange(data.predicted_range_km);
                }
            })
            .catch(console.error)
            .finally(() => setRangeLoading(false));
        }, 200);

        return () => clearTimeout(delayDebounce);
    }, [
        token,
        activeTab,
        rangeBatterySoc,
        rangeDistance,
        rangeSpeed,
        rangeAcStatus,
        rangeTemp,
        rangeRouteType,
        rangeElevation,
        rangeVehicle
    ]);

    const handleLoadPreset = (driverId: string) => {
        const drv = driversList.find(d => d.id === driverId);
        if (!drv) return;
        setSimDailyDistance(drv.daily_distance_km || 100);
        setSimAvgSpeed(drv.avg_speed || 60);
        setSimHarshBraking(drv.harsh_braking || 2);
        setSimHarshAcceleration(drv.harsh_acceleration || 2);
        setSimEndOfDayCharge(drv.end_of_day_charge || 50);
        setSimDailyIncome(drv.daily_income || 200);
        setSimMaintCharges(drv.maintenance_charges || 10);
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        );
    }

    if (driversList.length === 0) {
        return (
            <div className="space-y-5">
                <PageHeader title="AI Driver Scoring" subtitle="Explainable driver performance powered by VoltFleet's ML models." />
                <div className="glass rounded-2xl p-8 text-center text-muted-foreground">
                    No active drivers found.
                </div>
            </div>
        );
    }

    const selectedDriver = driversList.find(d => d.id === selectedDriverId) || driversList[0];

    const breakdown = [
        { label: "Safety", value: selectedDriver.safety_score, icon: ShieldCheck, color: "oklch(0.78 0.2 160)" },
        { label: "Efficiency", value: selectedDriver.efficiency_score, icon: Gauge, color: "oklch(0.72 0.18 230)" },
        { label: "Battery friendly", value: selectedDriver.battery_friendly, icon: BatteryCharging, color: "oklch(0.82 0.17 80)" },
        { label: "Route compliance", value: selectedDriver.route_compliance, icon: MapPin, color: "oklch(0.7 0.18 300)" },
    ];

    // Safe estimation calculation
    const rangeDeficit = predictedRange !== null ? rangeDistance - predictedRange : 0;
    const isReachable = rangeDeficit <= 0;

    return (
        <div className="space-y-5">
            <PageHeader title="AI Driver Analytics" subtitle="Interactive ML models to evaluate performance index and predict battery range." />

            {/* Tab Navigation */}
            <div className="flex gap-2 border-b border-border/40 pb-2">
                <button 
                    onClick={() => setActiveTab("dashboard")} 
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                        activeTab === "dashboard" 
                            ? "bg-primary/20 text-foreground border border-primary/30" 
                            : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                    Performance Index
                </button>
                <button 
                    onClick={() => setActiveTab("simulator")} 
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                        activeTab === "simulator" 
                            ? "bg-primary/20 text-foreground border border-primary/30" 
                            : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                    <Sparkles className="h-4 w-4" /> Real-time AI Simulator
                </button>
                <button 
                    onClick={() => setActiveTab("range_estimator")} 
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                        activeTab === "range_estimator" 
                            ? "bg-primary/20 text-foreground border border-primary/30" 
                            : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                    <BatteryCharging className="h-4 w-4" /> AI Range Estimator
                </button>
            </div>

            {activeTab === "dashboard" ? (
                <>
                    {/* Performance Dashboard View */}
                    <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
                        {/* Score Card */}
                        <div className="glass rounded-2xl p-6 text-center flex flex-col justify-between items-center relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-300">
                                <Sparkles className="h-40 w-40 text-primary" />
                            </div>
                            <div className="inline-flex items-center gap-1.5 rounded-full bg-secondary/10 px-3 py-1 text-xs text-secondary font-medium">
                                <Sparkles className="h-3 w-3" /> Selected driver analysis
                            </div>
                            <div className="mt-3 text-lg font-semibold">{selectedDriver.name}</div>
                            <div className="text-xs text-muted-foreground">{selectedDriver.group} Fleet</div>
                            
                            <div className="relative mx-auto mt-4 h-52 w-52">
                                <ResponsiveContainer>
                                    <RadialBarChart innerRadius="78%" outerRadius="100%" data={[{ name: "score", value: selectedDriver.ai_score, fill: "url(#aig)" }]} startAngle={90} endAngle={-270}>
                                        <defs>
                                            <linearGradient id="aig" x1="0" y1="0" x2="1" y2="1">
                                                <stop offset="0%" stopColor="oklch(0.72 0.18 230)" />
                                                <stop offset="100%" stopColor="oklch(0.78 0.2 160)" />
                                            </linearGradient>
                                        </defs>
                                        <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                                        <RadialBar dataKey="value" cornerRadius={20} background={{ fill: "oklch(0.25 0.02 250)" }} />
                                    </RadialBarChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 grid place-items-center">
                                    <div className="text-center">
                                        <div className="font-display text-5xl font-semibold gradient-text">{selectedDriver.ai_score}</div>
                                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">Rating</div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 w-full grid grid-cols-2 gap-3 text-xs text-left border-t border-border/40 pt-4">
                                <div>
                                    <span className="text-muted-foreground">Daily distance:</span>
                                    <div className="font-semibold">{(selectedDriver.daily_distance_km || 0).toFixed(1)} km</div>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Avg speed:</span>
                                    <div className="font-semibold">{(selectedDriver.avg_speed || 0).toFixed(1)} km/h</div>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Daily revenue:</span>
                                    <div className="font-semibold text-emerald-400">${(selectedDriver.daily_income || 0).toFixed(0)}</div>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Maint charges:</span>
                                    <div className="font-semibold text-rose-400">${(selectedDriver.maintenance_charges || 0).toFixed(0)}/day</div>
                                </div>
                            </div>
                        </div>

                        {/* Metrics Breakdown */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            {breakdown.map((b) => (
                                <div key={b.label} className="glass rounded-2xl p-5 flex flex-col justify-between transition-transform duration-200 hover:scale-[1.01]">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <b.icon className="h-4 w-4" style={{ color: b.color }} />
                                            {b.label}
                                        </div>
                                        <div className="font-display text-2xl font-semibold" style={{ color: b.color }}>{b.value}</div>
                                    </div>
                                    <div className="mt-4">
                                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                                            <div className="h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${b.value}%`, background: b.color }} />
                                        </div>
                                        <div className="mt-2 text-[10px] text-muted-foreground flex justify-between">
                                            <span>Target: 85+</span>
                                            <span>{b.value >= 90 ? "Excellent" : b.value >= 80 ? "Optimal" : "Needs Coaching"}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* AI Recommendations */}
                    <div className="glass rounded-2xl p-6">
                        <div className="flex items-center gap-2 text-sm text-primary font-medium">
                            <Sparkles className="h-4 w-4" /> AI ML-based recommendations for {selectedDriver.name}
                        </div>
                        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                            {selectedDriver.recommendations.map((t: string) => (
                                <li key={t} className="rounded-xl border border-border/30 bg-card/20 p-3 text-sm flex gap-2.5 items-start">
                                    <div className="h-5 w-5 rounded-full bg-primary/10 grid place-items-center shrink-0 mt-0.5">
                                        <Sparkles className="h-3 w-3 text-primary" />
                                    </div>
                                    <span>{t}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Leaderboard Table */}
                    <div className="glass overflow-hidden rounded-2xl border border-border/40">
                        <div className="bg-card/20 px-5 py-4 border-b border-border/40 flex justify-between items-center">
                            <h3 className="font-display text-base font-semibold">Active Drivers performance index</h3>
                            <span className="text-xs text-muted-foreground">Click a row to select driver</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-card/40 text-xs uppercase tracking-wider text-muted-foreground">
                                    <tr>
                                        {["Driver Name", "ML Rating", "Safety Score", "Efficiency Score", "Trips", "Total Distance"].map(h => (
                                            <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {driversList.map((d) => (
                                        <tr 
                                            key={d.id} 
                                            onClick={() => setSelectedDriverId(d.id)}
                                            className={`border-t border-border/30 hover:bg-card/30 cursor-pointer transition-colors ${
                                                selectedDriverId === d.id ? 'bg-primary/10 hover:bg-primary/15' : ''
                                            }`}
                                        >
                                            <td className="px-5 py-3.5 font-medium flex items-center gap-3">
                                                <div className={`grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br ${d.avatar_color} font-display text-xs font-semibold text-background shadow-sm`}>
                                                    {d.name.split(" ").map((n: string) => n[0]).join("")}
                                                </div>
                                                <div>
                                                    <div>{d.name}</div>
                                                    <div className="text-[10px] text-muted-foreground">{d.group} Fleet</div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className="rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 px-2.5 py-0.5 font-semibold text-foreground text-xs border border-primary/20">
                                                    {d.ai_score}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-muted-foreground font-semibold">{d.safety_score}</td>
                                            <td className="px-5 py-3.5 text-muted-foreground font-semibold">{d.efficiency_score}</td>
                                            <td className="px-5 py-3.5 text-muted-foreground">{d.trips}</td>
                                            <td className="px-5 py-3.5 text-muted-foreground">
                                                {Math.round(d.distance / 1609.34).toLocaleString()} mi
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : activeTab === "simulator" ? (
                /* Simulator View */
                <div className="grid gap-5 lg:grid-cols-[2fr_1.2fr]">
                    {/* Controls Panel */}
                    <div className="glass rounded-2xl p-6 space-y-6">
                        <div className="flex items-center justify-between border-b border-border/30 pb-4">
                            <div className="flex items-center gap-2">
                                <Sliders className="h-5 w-5 text-primary" />
                                <div>
                                    <h3 className="font-display font-semibold text-base">Simulation parameters</h3>
                                    <p className="text-xs text-muted-foreground">Tweak metrics to predict performance score in real time.</p>
                                </div>
                            </div>
                            
                            {/* Preset Selector */}
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Load driver baseline:</span>
                                <select 
                                    onChange={(e) => handleLoadPreset(e.target.value)}
                                    defaultValue=""
                                    className="bg-card/40 border border-border/30 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
                                >
                                    <option value="" disabled>Select Driver...</option>
                                    {driversList.map(d => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                            {/* Daily Distance */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground font-medium">Daily Distance</span>
                                    <span className="font-semibold text-primary">{simDailyDistance} km</span>
                                </div>
                                <input 
                                    type="range" min="10" max="300" step="5"
                                    value={simDailyDistance}
                                    onChange={(e) => setSimDailyDistance(Number(e.target.value))}
                                    className="w-full accent-primary bg-muted rounded-lg h-2 cursor-pointer"
                                />
                            </div>

                            {/* Average Speed */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground font-medium">Average Speed</span>
                                    <span className="font-semibold text-primary">{simAvgSpeed} km/h</span>
                                </div>
                                <input 
                                    type="range" min="15" max="120" step="1"
                                    value={simAvgSpeed}
                                    onChange={(e) => setSimAvgSpeed(Number(e.target.value))}
                                    className="w-full accent-primary bg-muted rounded-lg h-2 cursor-pointer"
                                />
                            </div>

                            {/* Harsh Braking */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground font-medium">Harsh Braking / day</span>
                                    <span className="font-semibold text-rose-400">{simHarshBraking} events</span>
                                </div>
                                <input 
                                    type="range" min="0" max="15" step="0.1"
                                    value={simHarshBraking}
                                    onChange={(e) => setSimHarshBraking(Number(e.target.value))}
                                    className="w-full accent-primary bg-muted rounded-lg h-2 cursor-pointer"
                                />
                            </div>

                            {/* Harsh Acceleration */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground font-medium">Harsh Acceleration / day</span>
                                    <span className="font-semibold text-rose-400">{simHarshAcceleration} events</span>
                                </div>
                                <input 
                                    type="range" min="0" max="15" step="0.1"
                                    value={simHarshAcceleration}
                                    onChange={(e) => setSimHarshAcceleration(Number(e.target.value))}
                                    className="w-full accent-primary bg-muted rounded-lg h-2 cursor-pointer"
                                />
                            </div>

                            {/* Battery SOC */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground font-medium">End-of-day Battery charge</span>
                                    <span className="font-semibold text-emerald-400">{simEndOfDayCharge}%</span>
                                </div>
                                <input 
                                    type="range" min="10" max="100" step="1"
                                    value={simEndOfDayCharge}
                                    onChange={(e) => setSimEndOfDayCharge(Number(e.target.value))}
                                    className="w-full accent-primary bg-muted rounded-lg h-2 cursor-pointer"
                                />
                            </div>

                            {/* Daily Income */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground font-medium">Daily Income</span>
                                    <span className="font-semibold text-emerald-400">${simDailyIncome}</span>
                                </div>
                                <input 
                                    type="range" min="50" max="800" step="10"
                                    value={simDailyIncome}
                                    onChange={(e) => setSimDailyIncome(Number(e.target.value))}
                                    className="w-full accent-primary bg-muted rounded-lg h-2 cursor-pointer"
                                />
                            </div>

                            {/* Daily Maintenance */}
                            <div className="space-y-2 sm:col-span-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground font-medium">Maintenance charges</span>
                                    <span className="font-semibold text-rose-400">${simMaintCharges} / day</span>
                                </div>
                                <input 
                                    type="range" min="0" max="150" step="5"
                                    value={simMaintCharges}
                                    onChange={(e) => setSimMaintCharges(Number(e.target.value))}
                                    className="w-full accent-primary bg-muted rounded-lg h-2 cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Result Panel */}
                    <div className="glass rounded-2xl p-6 text-center flex flex-col justify-between items-center relative overflow-hidden group">
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary font-medium">
                            <Sparkles className="h-3 w-3" /> Live simulated rating
                        </div>

                        <div className="relative mx-auto mt-6 h-56 w-56">
                            {simLoading && (
                                <div className="absolute inset-0 z-10 grid place-items-center bg-background/20 backdrop-blur-[1px] rounded-full">
                                    <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                                </div>
                            )}
                            <ResponsiveContainer>
                                <RadialBarChart innerRadius="78%" outerRadius="100%" data={[{ name: "score", value: simulatedScore || 85, fill: "url(#sim_g)" }]} startAngle={90} endAngle={-270}>
                                    <defs>
                                        <linearGradient id="sim_g" x1="0" y1="0" x2="1" y2="1">
                                            <stop offset="0%" stopColor="oklch(0.72 0.18 230)" />
                                            <stop offset="100%" stopColor="oklch(0.78 0.2 160)" />
                                        </linearGradient>
                                    </defs>
                                    <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                                    <RadialBar dataKey="value" cornerRadius={20} background={{ fill: "oklch(0.25 0.02 250)" }} />
                                </RadialBarChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 grid place-items-center">
                                <div className="text-center">
                                    <div className="font-display text-6xl font-semibold gradient-text">{simulatedScore !== null ? simulatedScore : "--"}</div>
                                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">Predicted score</div>
                                </div>
                            </div>
                        </div>

                        {/* Explainable AI Analysis */}
                        <div className="mt-6 w-full text-xs text-left border-t border-border/40 pt-4 space-y-2.5">
                            <span className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">Model feature impact</span>
                            
                            <div className="space-y-1.5">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground flex items-center gap-1"><ArrowUpRight className="h-3 w-3 text-emerald-400" /> Daily Distance</span>
                                    <span className="text-emerald-400 font-medium">+0.01 / km</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground flex items-center gap-1"><ArrowDownRight className="h-3 w-3 text-rose-400" /> Average Speed</span>
                                    <span className="text-rose-400 font-medium">-0.12 / km/h</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground flex items-center gap-1"><ArrowDownRight className="h-3 w-3 text-rose-400" /> Harsh Braking</span>
                                    <span className="text-rose-400 font-medium">-0.84 / event</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground flex items-center gap-1"><ArrowDownRight className="h-3 w-3 text-rose-400" /> Harsh Acceleration</span>
                                    <span className="text-rose-400 font-medium">-0.83 / event</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* AI Range Estimator View */
                <div className="grid gap-5 lg:grid-cols-[2fr_1.2fr]">
                    {/* Controls Panel */}
                    <div className="glass rounded-2xl p-6 space-y-6">
                        <div className="flex items-center gap-2 border-b border-border/30 pb-4">
                            <BatteryCharging className="h-5 w-5 text-primary" />
                            <div>
                                <h3 className="font-display font-semibold text-base">Estimated range calculator</h3>
                                <p className="text-xs text-muted-foreground">Simulate operational details to predict remaining battery range using Random Forest.</p>
                            </div>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                            {/* Vehicle Preset Selector */}
                            <div className="space-y-2 sm:col-span-2">
                                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                                    <Car className="h-4 w-4 text-primary" /> Selected Vehicle Model
                                </label>
                                <select 
                                    value={rangeVehicle.name}
                                    onChange={(e) => {
                                        const selected = VEHICLE_PRESETS.find(v => v.name === e.target.value);
                                        if (selected) setRangeVehicle(selected);
                                    }}
                                    className="w-full bg-card/45 border border-border/35 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                                >
                                    {VEHICLE_PRESETS.map(v => (
                                        <option key={v.name} value={v.name}>
                                            {v.name} — {v.battery_capacity_kwh} kWh Battery
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Current SOC */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-semibold">
                                    <span className="text-muted-foreground">Current State of Charge</span>
                                    <span className="text-primary">{rangeBatterySoc}%</span>
                                </div>
                                <input 
                                    type="range" min="1" max="100" step="1"
                                    value={rangeBatterySoc}
                                    onChange={(e) => setRangeBatterySoc(Number(e.target.value))}
                                    className="w-full accent-primary bg-muted rounded-lg h-2 cursor-pointer"
                                />
                            </div>

                            {/* Distance to Destination */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-semibold">
                                    <span className="text-muted-foreground">Distance to Destination</span>
                                    <span className="text-primary">{rangeDistance} km</span>
                                </div>
                                <input 
                                    type="range" min="5" max="300" step="5"
                                    value={rangeDistance}
                                    onChange={(e) => setRangeDistance(Number(e.target.value))}
                                    className="w-full accent-primary bg-muted rounded-lg h-2 cursor-pointer"
                                />
                            </div>

                            {/* Current Speed */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-semibold">
                                    <span className="text-muted-foreground">Current Speed</span>
                                    <span className="text-primary">{rangeSpeed} km/h</span>
                                </div>
                                <input 
                                    type="range" min="0" max="130" step="5"
                                    value={rangeSpeed}
                                    onChange={(e) => setRangeSpeed(Number(e.target.value))}
                                    className="w-full accent-primary bg-muted rounded-lg h-2 cursor-pointer"
                                />
                            </div>

                            {/* Outside Temp */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-semibold">
                                    <span className="text-muted-foreground">Outside Temperature</span>
                                    <span className="text-primary">{rangeTemp} °C</span>
                                </div>
                                <input 
                                    type="range" min="-10" max="45" step="1"
                                    value={rangeTemp}
                                    onChange={(e) => setRangeTemp(Number(e.target.value))}
                                    className="w-full accent-primary bg-muted rounded-lg h-2 cursor-pointer"
                                />
                            </div>

                            {/* Elevation Ahead */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-semibold">
                                    <span className="text-muted-foreground">Elevation Ahead</span>
                                    <span className="text-primary">{rangeElevation} m</span>
                                </div>
                                <input 
                                    type="range" min="-100" max="800" step="10"
                                    value={rangeElevation}
                                    onChange={(e) => setRangeElevation(Number(e.target.value))}
                                    className="w-full accent-primary bg-muted rounded-lg h-2 cursor-pointer"
                                />
                            </div>

                            {/* Route Type */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-muted-foreground block">Route Type</label>
                                <select 
                                    value={rangeRouteType}
                                    onChange={(e) => setRangeRouteType(e.target.value)}
                                    className="w-full bg-card/40 border border-border/30 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
                                >
                                    <option value="City">City (Stop & Go)</option>
                                    <option value="Mixed">Mixed (Suburban)</option>
                                    <option value="Highway">Highway (High Speed)</option>
                                </select>
                            </div>

                            {/* AC Status */}
                            <div className="space-y-2 sm:col-span-2">
                                <label className="text-xs font-semibold text-muted-foreground block">AC System Status</label>
                                <div className="flex gap-4 mt-1">
                                    <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                                        <input 
                                            type="radio" name="ac_status" checked={rangeAcStatus === 1}
                                            onChange={() => setRangeAcStatus(1)}
                                            className="accent-primary"
                                        />
                                        Active (AC On)
                                    </label>
                                    <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                                        <input 
                                            type="radio" name="ac_status" checked={rangeAcStatus === 0}
                                            onChange={() => setRangeAcStatus(0)}
                                            className="accent-primary"
                                        />
                                        Inactive (AC Off)
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Result Panel */}
                    <div className="glass rounded-2xl p-6 text-center flex flex-col justify-between items-center relative overflow-hidden">
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary font-medium">
                            <Sparkles className="h-3 w-3" /> Live Range Estimate
                        </div>

                        <div className="relative mx-auto mt-6 h-56 w-56">
                            {rangeLoading && (
                                <div className="absolute inset-0 z-10 grid place-items-center bg-background/20 backdrop-blur-[1px] rounded-full">
                                    <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                                </div>
                            )}
                            <ResponsiveContainer>
                                <RadialBarChart innerRadius="78%" outerRadius="100%" data={[{ name: "range", value: Math.min(400, predictedRange || 180), fill: "url(#range_g)" }]} startAngle={90} endAngle={-270}>
                                    <defs>
                                        <linearGradient id="range_g" x1="0" y1="0" x2="1" y2="1">
                                            <stop offset="0%" stopColor="oklch(0.82 0.17 80)" />
                                            <stop offset="100%" stopColor="oklch(0.72 0.18 230)" />
                                        </linearGradient>
                                    </defs>
                                    <PolarAngleAxis type="number" domain={[0, 400]} tick={false} />
                                    <RadialBar dataKey="value" cornerRadius={20} background={{ fill: "oklch(0.25 0.02 250)" }} />
                                </RadialBarChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 grid place-items-center">
                                <div className="text-center">
                                    <div className="font-display text-5xl font-semibold gradient-text">{predictedRange !== null ? `${predictedRange} km` : "--"}</div>
                                    <div className="text-[10px] text-muted-foreground mt-0.5">
                                        {predictedRange !== null ? `~${Math.round(predictedRange / 1.60934)} miles` : ""}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Feasibility Alert Card */}
                        <div className="mt-6 w-full text-xs text-left border-t border-border/40 pt-4 space-y-3">
                            <span className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">Route feasibility assistant</span>
                            
                            {predictedRange !== null && (
                                <div className={`p-4 rounded-xl border flex gap-2.5 items-start ${
                                    isReachable 
                                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                                        : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                                }`}>
                                    {isReachable ? (
                                        <>
                                            <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
                                            <div>
                                                <div className="font-semibold">Destination Reachable</div>
                                                <p className="text-[11px] opacity-80 mt-0.5">
                                                    Your simulated battery range has a safe margin of {Math.abs(rangeDeficit).toFixed(1)} km to spare.
                                                </p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 animate-pulse" />
                                            <div>
                                                <div className="font-semibold text-rose-400">Recharge Required</div>
                                                <p className="text-[11px] opacity-85 mt-0.5">
                                                    You are short by {rangeDeficit.toFixed(1)} km. Plan an opportunity charge before reaching your destination.
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

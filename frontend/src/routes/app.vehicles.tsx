import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { type VehicleStatus } from "@/lib/mock-data";
import { Battery, Grid3x3, List, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/app/vehicles")({
    head: () => ({ meta: [{ title: "Vehicles — VoltFleet AI" }] }),
    component: VehiclesPage,
});

const API_BASE = "http://localhost:8000";
const filters: (VehicleStatus | "all")[] = ["all", "active", "charging", "offline", "maintenance"];
const statusBadge: Record<VehicleStatus, string> = {
    active: "bg-secondary/15 text-secondary",
    charging: "bg-primary/15 text-primary",
    garage: "bg-fuchsia-500/15 text-fuchsia-300",
    maintenance: "bg-amber-500/15 text-amber-300",
    offline: "bg-rose-500/15 text-rose-300",
};

function VehiclesPage() {
    const { token, user } = useAuth();
    const [vehiclesList, setVehiclesList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<"grid" | "table">("grid");
    const [filter, setFilter] = useState<(typeof filters)[number]>("all");

    // Modal & Form States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [vin, setVin] = useState("");
    const [brand, setBrand] = useState("");
    const [model, setModel] = useState("");
    const [batteryCapacity, setBatteryCapacity] = useState<number>(75);
    const [groupId, setGroupId] = useState("");
    const [groupsList, setGroupsList] = useState<any[]>([]);
    const [submitting, setSubmitting] = useState(false);

    const loadVehicles = () => {
        if (!token) return;
        setLoading(true);
        fetch(`${API_BASE}/api/vehicles/`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(data => {
                if (Array.isArray(data)) {
                    const mapped = data.map((v: any) => ({
                        id: v.vehicle_id,
                        make: v.make,
                        model: v.model,
                        year: v.year,
                        status: v.status,
                        soc: v.soc,
                        soh: v.soh,
                        batteryCapacity: v.battery_capacity,
                        driver: v.driver_name || "—",
                        range: v.range_miles,
                        lastUpdated: (() => {
                            if (!v.last_updated) return "Just now";
                            if (typeof v.last_updated === "string" && (v.last_updated.includes("ago") || v.last_updated.includes("now"))) return v.last_updated;
                            const d = new Date(v.last_updated);
                            return isNaN(d.getTime()) ? String(v.last_updated) : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        })()
                    }));
                    setVehiclesList(mapped);
                } else {
                    setVehiclesList([]);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadVehicles();
    }, [token]);

    useEffect(() => {
        if (!token) return;
        fetch(`${API_BASE}/api/drivers/groups`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setGroupsList(data);
                    if (data.length > 0) {
                        setGroupId(data[0].group_id);
                    }
                }
            })
            .catch(console.error);
    }, [token]);

    const handleAddVehicleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (vin.length !== 17) {
            toast.error("VIN must be exactly 17 characters long.");
            return;
        }
        setSubmitting(true);
        try {
            const res = await fetch(`${API_BASE}/api/vehicles`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    vin,
                    brand,
                    model,
                    battery_capacity_kwh: batteryCapacity,
                    group_id: groupId || null
                })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || "Failed to add vehicle");
            }

            toast.success("Vehicle registered successfully");
            setIsAddModalOpen(false);
            // Reset form
            setVin("");
            setBrand("");
            setModel("");
            setBatteryCapacity(75);
            // Refresh
            loadVehicles();
        } catch (err: any) {
            toast.error(err.message || "An error occurred");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        );
    }

    const filtered = filter === "all" ? vehiclesList : vehiclesList.filter(v => v.status === filter);

    return (
        <div className="space-y-5">
            <PageHeader 
                title={user?.role === "driver" ? "My Vehicle" : "Vehicles"} 
                subtitle={user?.role === "driver" ? "Your assigned electric vehicle specifications, battery telemetry, and real-time status." : "All EVs in your fleet"} 
                actions={
                    <>
                        <div className="inline-flex rounded-lg border border-border bg-card/50 p-0.5">
                            <button onClick={() => setView("grid")} className={`grid h-8 w-8 place-items-center rounded-md ${view === "grid" ? "bg-card" : "text-muted-foreground"}`}><Grid3x3 className="h-4 w-4" /></button>
                            <button onClick={() => setView("table")} className={`grid h-8 w-8 place-items-center rounded-md ${view === "table" ? "bg-card" : "text-muted-foreground"}`}><List className="h-4 w-4" /></button>
                        </div>
                        {user?.role !== "driver" && (
                            <button onClick={() => setIsAddModalOpen(true)} className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-gradient-to-r from-primary to-secondary px-3 py-2 text-sm font-medium text-background"><Plus className="h-4 w-4" />Add vehicle</button>
                        )}
                    </>
                } 
            />

            <div className="flex flex-wrap gap-2">
                {filters.map((f) => (
                    <button key={f} onClick={() => setFilter(f)}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition ${filter === f ? "bg-gradient-to-r from-primary to-secondary text-background" : "border border-border bg-card/40 text-muted-foreground hover:text-foreground"}`}>
                        {f} {f !== "all" && <span className="ml-1 opacity-70">({vehiclesList.filter(v => v.status === f).length})</span>}
                    </button>
                ))}
            </div>

            {view === "grid" ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filtered.map((v) => (
                        <div key={v.id} className="group glass rounded-2xl p-4 transition hover:translate-y-[-2px]">
                            <div className="relative h-32 overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 to-secondary/5">
                                <svg viewBox="0 0 200 100" className="absolute inset-0 h-full w-full">
                                    <defs>
                                        <linearGradient id={`car-${v.id}`} x1="0" y1="0" x2="1" y2="1">
                                            <stop offset="0%" stopColor="oklch(0.72 0.18 230)" />
                                            <stop offset="100%" stopColor="oklch(0.78 0.2 160)" />
                                        </linearGradient>
                                    </defs>
                                    <path d="M20,70 L40,40 L140,40 L170,70 L180,70 L180,80 L20,80 Z" fill={`url(#car-${v.id})`} opacity="0.85" />
                                    <circle cx="55" cy="80" r="9" fill="oklch(0.12 0.02 250)" />
                                    <circle cx="150" cy="80" r="9" fill="oklch(0.12 0.02 250)" />
                                    <rect x="50" y="48" width="40" height="16" fill="oklch(0.18 0.025 250)" opacity="0.6" />
                                    <rect x="95" y="48" width="40" height="16" fill="oklch(0.18 0.025 250)" opacity="0.6" />
                                </svg>
                                <span className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${statusBadge[v.status as VehicleStatus] || "bg-card text-muted-foreground animate-pulse"}`}>{v.status}</span>
                            </div>
                            <div className="mt-3 flex items-start justify-between">
                                <div>
                                    <div className="font-display text-base font-semibold">{v.id}</div>
                                    <div className="text-xs text-muted-foreground">{v.make} {v.model} · {v.year}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-muted-foreground">SoC</div>
                                    <div className="font-display text-lg font-semibold text-primary">{v.soc}%</div>
                                </div>
                            </div>
                            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                                <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${v.soc}%` }} />
                            </div>
                            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                                <span className="flex items-center gap-1"><Battery className="h-3.5 w-3.5" />{v.batteryCapacity} kWh</span>
                                <span>{v.lastUpdated}</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="glass overflow-hidden rounded-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-card/40 text-xs uppercase tracking-wider text-muted-foreground">
                                <tr>
                                    {["Vehicle", "Make / Model", "Driver", "Status", "SoC", "SoH", "Range", "Updated"].map(h => <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((v) => (
                                    <tr key={v.id} className="border-t border-border/40 hover:bg-card/30">
                                        <td className="px-4 py-3 font-medium">{v.id}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{v.make} {v.model}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{v.driver}</td>
                                        <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusBadge[v.status as VehicleStatus] || "bg-card text-muted-foreground"}`}>{v.status}</span></td>
                                        <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted"><div className="h-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${v.soc}%` }} /></div><span className="text-xs">{v.soc}%</span></div></td>
                                        <td className="px-4 py-3">{v.soh}%</td>
                                        <td className="px-4 py-3">{v.range} mi</td>
                                        <td className="px-4 py-3 text-xs text-muted-foreground">{v.lastUpdated}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add Vehicle Dialog Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="sm:max-w-[425px] glass border border-border/80 text-foreground">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Add New Vehicle</DialogTitle>
                        <DialogDescription className="text-muted-foreground text-xs">
                            Enter the specifications for the new electric vehicle to register it to your fleet.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddVehicleSubmit} className="space-y-4 py-2">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-muted-foreground">VIN (17 Characters)</label>
                            <input
                                required
                                maxLength={17}
                                minLength={17}
                                type="text"
                                placeholder="1FTFW1ED5MXXXXXXX"
                                value={vin}
                                onChange={(e) => setVin(e.target.value.toUpperCase())}
                                className="w-full rounded-lg border border-border/60 bg-card/40 px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-muted-foreground">Make / Brand</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Tesla"
                                    value={brand}
                                    onChange={(e) => setBrand(e.target.value)}
                                    className="w-full rounded-lg border border-border/60 bg-card/40 px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-muted-foreground">Model</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Model Y"
                                    value={model}
                                    onChange={(e) => setModel(e.target.value)}
                                    className="w-full rounded-lg border border-border/60 bg-card/40 px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-muted-foreground">Battery Capacity (kWh)</label>
                                <input
                                    required
                                    type="number"
                                    min={1}
                                    max={300}
                                    placeholder="e.g. 75"
                                    value={batteryCapacity || ""}
                                    onChange={(e) => setBatteryCapacity(parseFloat(e.target.value))}
                                    className="w-full rounded-lg border border-border/60 bg-card/40 px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-muted-foreground">Fleet Hub Group</label>
                                <select
                                    value={groupId}
                                    onChange={(e) => setGroupId(e.target.value)}
                                    className="w-full rounded-lg border border-border/60 bg-card/40 px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none"
                                >
                                    <option value="" disabled className="bg-background">Select group</option>
                                    {groupsList.map((g) => (
                                        <option key={g.group_id} value={g.group_id} className="bg-background">
                                            {g.group_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <DialogFooter className="pt-4 gap-2 sm:gap-0">
                            <button
                                type="button"
                                onClick={() => setIsAddModalOpen(false)}
                                className="rounded-lg border border-border/60 bg-card/30 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer transition duration-150"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="rounded-lg bg-gradient-to-r from-primary to-secondary px-4 py-2 text-sm font-medium text-background hover:opacity-95 shadow-md cursor-pointer transition duration-150 disabled:opacity-50"
                            >
                                {submitting ? "Adding..." : "Register EV"}
                            </button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

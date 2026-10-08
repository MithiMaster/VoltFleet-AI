import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import {
    Maximize2,
    Minimize2,
    Filter,
    Layers,
    Search,
    BatteryCharging,
    Zap,
    Gauge,
    Thermometer,
    Compass,
    Navigation,
    User,
    AlertTriangle,
    RotateCw,
    Radio,
    Car,
    Wrench,
    CheckCircle2,
    Clock,
    X,
    ExternalLink,
    ChevronRight,
    MapPin,
    ArrowUpRight
} from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export const Route = createFileRoute("/app/fleet")({
    head: () => ({ meta: [{ title: "Live Fleet Monitor — VoltFleet AI" }] }),
    component: FleetMonitor,
});

const API_BASE = "http://localhost:8000";

interface VehicleTelemetry {
    vehicle_id: string;
    group_id: string | null;
    vin: string;
    make: string;
    brand: string;
    model: string;
    year: number;
    status: "active" | "charging" | "garage" | "maintenance" | "offline";
    soc: number;
    soh: number;
    battery_capacity: number;
    driver_name: string;
    range_km: number;
    range_miles: number;
    latitude: number;
    longitude: number;
    speed_kmh: number;
    speed_mph: number;
    temperature_celsius: number;
    voltage: number;
    heading_deg: number;
    odometer_km: number;
    odometer_miles: number;
    hub_city?: string;
    state?: string;
    location_name?: string;
    hub_name?: string;
    last_updated: string;
}

interface AlertItem {
    id: string;
    vehicle_id?: string;
    vehicle?: string;
    type: "critical" | "warning" | "info";
    title: string;
    message?: string;
    time: string;
}

const statusConfig: Record<
    string,
    { label: string; color: string; badge: string; dot: string; icon: any }
> = {
    active: {
        label: "On Road",
        color: "#10b981",
        badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
        dot: "bg-emerald-400",
        icon: Navigation
    },
    charging: {
        label: "Charging",
        color: "#f59e0b",
        badge: "bg-amber-500/15 text-amber-400 border-amber-500/30",
        dot: "bg-amber-400",
        icon: Zap
    },
    garage: {
        label: "In Garage",
        color: "#8b5cf6",
        badge: "bg-violet-500/15 text-violet-400 border-violet-500/30",
        dot: "bg-violet-400",
        icon: Car
    },
    maintenance: {
        label: "Maintenance",
        color: "#f97316",
        badge: "bg-orange-500/15 text-orange-400 border-orange-500/30",
        dot: "bg-orange-400",
        icon: Wrench
    },
    offline: {
        label: "Offline",
        color: "#ef4444",
        badge: "bg-rose-500/15 text-rose-400 border-rose-500/30",
        dot: "bg-rose-400",
        icon: Clock
    }
};

function FleetMonitor() {
    const { token } = useAuth();
    const navigate = useNavigate();

    // Vehicles & Telemetry States
    const [vehicles, setVehicles] = useState<VehicleTelemetry[]>([]);
    const [alertsList, setAlertsList] = useState<AlertItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

    // Filter & Search
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [sortBy, setSortBy] = useState<"soc" | "speed" | "id">("soc");

    // Map Settings
    const [tileStyle, setTileStyle] = useState<"dark" | "streets">("dark");
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
    const [selectedVehicle, setSelectedVehicle] = useState<VehicleTelemetry | null>(null);

    // Map & Layer References
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markersLayerRef = useRef<L.LayerGroup | null>(null);
    const vehicleMarkersMap = useRef<Map<string, L.Marker>>(new Map());

    // Fetch live vehicles and alerts from API
    const fetchFleetData = async (isManual = false) => {
        if (!token) return;
        if (isManual) setIsRefreshing(true);

        try {
            const [vRes, aRes] = await Promise.all([
                fetch(`${API_BASE}/api/vehicles/`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                fetch(`${API_BASE}/api/alerts/`, {
                    headers: { Authorization: `Bearer ${token}` }
                }).catch(() => null)
            ]);

            if (vRes.ok) {
                const data: VehicleTelemetry[] = await vRes.json();
                setVehicles(data);

                // Update selected vehicle reference if currently inspected
                if (selectedVehicle) {
                    const updated = data.find((v) => v.vehicle_id === selectedVehicle.vehicle_id);
                    if (updated) setSelectedVehicle(updated);
                }
            }

            if (aRes && aRes.ok) {
                const aData = await aRes.json();
                setAlertsList(Array.isArray(aData) ? aData.slice(0, 15) : []);
            }
        } catch (err) {
            console.error("Failed to fetch fleet telemetry:", err);
            if (isManual) toast.error("Could not refresh fleet telemetry");
        } finally {
            setLoading(false);
            if (isManual) setIsRefreshing(false);
        }
    };

    // Initial Fetch
    useEffect(() => {
        fetchFleetData();
    }, [token]);

    // Live Telemetry Polling (every 5 seconds)
    useEffect(() => {
        if (!autoRefresh) return;
        const interval = setInterval(() => {
            fetchFleetData();
        }, 5000);
        return () => clearInterval(interval);
    }, [autoRefresh, token, selectedVehicle]);

    // Initialize Leaflet Map
    useEffect(() => {
        if (!mapContainerRef.current || mapInstanceRef.current) return;

        const map = L.map(mapContainerRef.current, {
            zoomControl: false,
            attributionControl: true,
            worldCopyJump: true,
            minZoom: 2,
            maxZoom: 19
        }).setView([21.7679, 78.8718], 5); // National All-India Fleet Overview

        // 100% Free OpenStreetMap tile layer (NO API KEY REQUIRED)
        const osmUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
        L.tileLayer(osmUrl, {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
            subdomains: ["a", "b", "c"],
            maxZoom: 19
        }).addTo(map);

        L.control.zoom({ position: "topright" }).addTo(map);

        const markersGroup = L.layerGroup().addTo(map);
        markersLayerRef.current = markersGroup;
        mapInstanceRef.current = map;

        // Container resize observer
        const resizeObserver = new ResizeObserver(() => {
            map.invalidateSize();
        });
        resizeObserver.observe(mapContainerRef.current);

        setTimeout(() => {
            map.invalidateSize();
        }, 200);

        return () => {
            resizeObserver.disconnect();
            map.remove();
            mapInstanceRef.current = null;
        };
    }, []);

    // Filter vehicles by search & status
    const filteredVehicles = useMemo(() => {
        return vehicles
            .filter((v) => {
                const matchesStatus =
                    statusFilter === "all" || v.status.toLowerCase() === statusFilter.toLowerCase();
                const q = searchQuery.toLowerCase().trim();
                const matchesSearch =
                    !q ||
                    v.vehicle_id.toLowerCase().includes(q) ||
                    v.model.toLowerCase().includes(q) ||
                    v.brand.toLowerCase().includes(q) ||
                    v.driver_name.toLowerCase().includes(q) ||
                    v.vin.toLowerCase().includes(q);
                return matchesStatus && matchesSearch;
            })
            .sort((a, b) => {
                if (sortBy === "soc") return b.soc - a.soc;
                if (sortBy === "speed") return b.speed_kmh - a.speed_kmh;
                return a.vehicle_id.localeCompare(b.vehicle_id);
            });
    }, [vehicles, statusFilter, searchQuery, sortBy]);

    // Plot Vehicle Markers on Map
    useEffect(() => {
        const map = mapInstanceRef.current;
        const markersGroup = markersLayerRef.current;
        if (!map || !markersGroup) return;

        markersGroup.clearLayers();
        vehicleMarkersMap.current.clear();

        const bounds = L.latLngBounds([]);

        filteredVehicles.forEach((v) => {
            if (v.latitude == null || v.longitude == null) return;

            const latLng: [number, number] = [v.latitude, v.longitude];
            bounds.extend(latLng);

            const isSelected = selectedVehicle?.vehicle_id === v.vehicle_id;
            const cfg = statusConfig[v.status] || statusConfig.active;

            // Sleek vehicle marker icon with pulse
            const iconHtml = `
                <div class="relative flex items-center justify-center cursor-pointer group">
                    ${
                        v.status === "active"
                            ? `<div class="absolute -inset-2 rounded-full bg-emerald-500/30 animate-ping"></div>`
                            : v.status === "charging"
                            ? `<div class="absolute -inset-2 rounded-full bg-amber-500/40 animate-pulse"></div>`
                            : ""
                    }
                    <div class="relative flex items-center gap-1 rounded-full px-2 py-1 text-white font-bold text-[11px] shadow-2xl border-2 transition-all duration-200 group-hover:scale-110"
                        style="background: ${cfg.color}; border-color: ${isSelected ? '#ffffff' : '#09090b'}; box-shadow: 0 0 ${isSelected ? '20px #38bdf8' : '10px rgba(0,0,0,0.5)'};">
                        <span>${v.status === "charging" ? "⚡" : "🚗"}</span>
                        <span>${v.vehicle_id}</span>
                    </div>
                </div>
            `;

            const customIcon = L.divIcon({
                className: "custom-fleet-pin",
                html: iconHtml,
                iconSize: [60, 26],
                iconAnchor: [30, 13],
                popupAnchor: [0, -16]
            });

            const marker = L.marker(latLng, { icon: customIcon }).addTo(markersGroup);

            // Interactive popup with location details
            marker.bindPopup(`
                <div style="font-family: sans-serif; color: #111; min-width: 190px; padding: 2px;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                        <span style="font-weight: 800; font-size: 14px;">${v.vehicle_id}</span>
                        <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; background: ${cfg.color}20; color: ${cfg.color}; padding: 2px 6px; border-radius: 9999px;">
                            ${cfg.label}
                        </span>
                    </div>
                    <div style="font-size: 12px; color: #334155; font-weight: 600;">${v.make} ${v.model}</div>
                    <div style="margin-top: 6px; font-size: 11px; display: grid; gap: 3px;">
                        <div><b>Location:</b> <span style="color: #0284c7; font-weight: bold;">${v.location_name || v.hub_city || 'India'}</span></div>
                        <div><b>Driver:</b> ${v.driver_name}</div>
                        <div><b>Battery SoC:</b> <span style="color: ${v.soc > 20 ? '#059669' : '#dc2626'}; font-weight: bold;">${v.soc}%</span></div>
                        <div><b>Speed:</b> ${v.speed_kmh} km/h (${v.speed_mph} mph)</div>
                        <div><b>Range:</b> ${v.range_km} km</div>
                    </div>
                </div>
            `);

            marker.on("click", () => {
                setSelectedVehicle(v);
            });

            vehicleMarkersMap.current.set(v.vehicle_id, marker);
        });

        // Fit map bounds if there are markers and no vehicle is manually inspected
        if (bounds.isValid() && !selectedVehicle && filteredVehicles.length > 0) {
            map.fitBounds(bounds, { padding: [40, 40] });
        }
    }, [filteredVehicles, selectedVehicle]);

    // Fly map to vehicle position
    const handleInspectVehicle = (v: VehicleTelemetry) => {
        setSelectedVehicle(v);
        const map = mapInstanceRef.current;
        if (map && v.latitude != null && v.longitude != null) {
            map.flyTo([v.latitude, v.longitude], 13, { duration: 1.2 });
            const marker = vehicleMarkersMap.current.get(v.vehicle_id);
            if (marker) {
                setTimeout(() => marker.openPopup(), 400);
            }
        }
    };

    // Center entire fleet bounds across India
    const handleFitFleet = () => {
        const map = mapInstanceRef.current;
        if (!map) return;
        const bounds = L.latLngBounds([]);
        filteredVehicles.forEach((v) => {
            if (v.latitude != null && v.longitude != null) {
                bounds.extend([v.latitude, v.longitude]);
            }
        });
        if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [40, 40], animate: true });
        } else {
            map.setView([21.7679, 78.8718], 5);
        }
    };

    // Fleet Summary Counts
    const counts = useMemo(() => {
        const total = vehicles.length;
        const active = vehicles.filter((v) => v.status === "active").length;
        const charging = vehicles.filter((v) => v.status === "charging").length;
        const garage = vehicles.filter((v) => v.status === "garage").length;
        const maintenance = vehicles.filter((v) => v.status === "maintenance").length;
        const offline = vehicles.filter((v) => v.status === "offline").length;
        const avgSoc = total > 0 ? Math.round(vehicles.reduce((acc, v) => acc + v.soc, 0) / total) : 0;
        return { total, active, charging, garage, maintenance, offline, avgSoc };
    }, [vehicles]);

    return (
        <div className="space-y-4 text-foreground">
            <PageHeader
                title="Fleet Monitor"
                subtitle="Real-time geo-telemetry, live battery dynamics, and vehicle dispatch command."
                actions={
                    <div className="flex items-center gap-2">
                        {/* Live Polling Switch */}
                        <button
                            type="button"
                            onClick={() => setAutoRefresh(!autoRefresh)}
                            className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition cursor-pointer ${
                                autoRefresh
                                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                                    : "border-border bg-card/50 text-muted-foreground hover:bg-card"
                            }`}
                        >
                            <Radio className={`h-3.5 w-3.5 ${autoRefresh ? "animate-pulse text-emerald-400" : ""}`} />
                            <span>{autoRefresh ? "LIVE TELEMETRY" : "PAUSED"}</span>
                        </button>

                        {/* Manual Refresh */}
                        <button
                            type="button"
                            onClick={() => fetchFleetData(true)}
                            disabled={isRefreshing}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card/60 px-3 py-2 text-xs font-semibold hover:bg-card transition cursor-pointer text-foreground disabled:opacity-50"
                        >
                            <RotateCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
                            <span>Refresh</span>
                        </button>

                        {/* Fullscreen Toggle */}
                        <button
                            type="button"
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-secondary px-3 py-2 text-xs font-semibold text-background shadow-md hover:opacity-95 transition cursor-pointer"
                        >
                            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                            <span>{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
                        </button>
                    </div>
                }
            />

            {/* Custom CSS overrides for Leaflet with Dark Theme (Zero API Key) */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .leaflet-container {
                    background: #09090b !important;
                    font-family: inherit;
                    width: 100% !important;
                    height: 100% !important;
                    z-index: 10;
                }
                .fleet-dark-tiles .leaflet-tile {
                    filter: invert(100%) hue-rotate(180deg) brightness(92%) contrast(90%) saturate(0.85) !important;
                    transition: filter 0.3s ease;
                }
                .fleet-streets-tiles .leaflet-tile {
                    filter: none !important;
                    transition: filter 0.3s ease;
                }
                .custom-fleet-pin {
                    background: transparent !important;
                    border: none !important;
                }
                .leaflet-popup-content-wrapper {
                    background: #ffffff !important;
                    border-radius: 14px !important;
                    box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.5) !important;
                    border: 1px solid rgba(0,0,0,0.1) !important;
                }
                .leaflet-popup-tip {
                    background: #ffffff !important;
                }
            `}} />

            {/* Top Fleet Command Telemetry Bar */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
                {[
                    { label: "Active Fleet", value: counts.total, sub: "Vehicles in service", icon: Car, color: "text-sky-400" },
                    { label: "On Road", value: counts.active, sub: "Actively in transit", icon: Navigation, color: "text-emerald-400" },
                    { label: "Fast Charging", value: counts.charging, sub: "Connected to DCFC", icon: Zap, color: "text-amber-400" },
                    { label: "In Garage", value: counts.garage, sub: "Depot standby", icon: Compass, color: "text-violet-400" },
                    { label: "Avg Fleet SoC", value: `${counts.avgSoc}%`, sub: "Battery reserve", icon: BatteryCharging, color: "text-teal-400" },
                    { label: "Active Alerts", value: alertsList.length, sub: "Telemetry alerts", icon: AlertTriangle, color: "text-rose-400" },
                ].map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} className="glass rounded-2xl p-3.5 flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{stat.label}</span>
                                <Icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                            <div className="mt-2 text-2xl font-bold font-display text-foreground">{stat.value}</div>
                            <div className="text-[11px] text-muted-foreground">{stat.sub}</div>
                        </div>
                    );
                })}
            </div>

            {/* Main Interactive Fleet Workstation Grid */}
            <div className={`grid gap-4 ${isFullscreen ? "fixed inset-3 z-50 bg-background/95 backdrop-blur-xl p-3 rounded-3xl" : "lg:grid-cols-[7fr_3.5fr]"}`}>
                {/* Map Display Viewport */}
                <div className={`glass relative flex flex-col overflow-hidden rounded-2xl p-2.5 ${isFullscreen ? "h-full" : "h-[70vh] min-h-[500px]"}`}>
                    {/* Floating Controls Bar over Map */}
                    <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
                        {/* Tile Layer Switcher */}
                        <div className="flex rounded-xl bg-card/90 backdrop-blur-md p-1 border border-border shadow-lg">
                            <button
                                type="button"
                                onClick={() => setTileStyle("dark")}
                                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                                    tileStyle === "dark"
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                <Layers className="h-3 w-3" /> Dark Map
                            </button>
                            <button
                                type="button"
                                onClick={() => setTileStyle("streets")}
                                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                                    tileStyle === "streets"
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                Street View
                            </button>
                        </div>

                        {/* Fit All Vehicles Button */}
                        <button
                            type="button"
                            onClick={handleFitFleet}
                            title="Center all vehicles across India"
                            className="flex items-center gap-1.5 rounded-xl bg-card/90 backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-foreground border border-border shadow-lg hover:border-primary/50 transition cursor-pointer"
                        >
                            <Compass className="h-3.5 w-3.5 text-primary" /> All India Fleet
                        </button>
                    </div>

                    {/* Status Pill Indicator Legend on Bottom Map */}
                    <div className="absolute bottom-4 left-4 z-20 hidden sm:flex items-center gap-3 rounded-xl bg-card/90 backdrop-blur-md px-3 py-2 border border-border text-xs shadow-lg">
                        {Object.entries(statusConfig).map(([key, cfg]) => (
                            <div key={key} className="flex items-center gap-1.5">
                                <span className={`h-2.5 w-2.5 rounded-full ${cfg.dot}`} />
                                <span className="capitalize text-muted-foreground font-medium">{cfg.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Interactive Leaflet Map Canvas */}
                    <div
                        ref={mapContainerRef}
                        className={`h-full w-full rounded-xl overflow-hidden ${
                            tileStyle === "dark" ? "fleet-dark-tiles" : "fleet-streets-tiles"
                        }`}
                    />

                    {/* Selected Vehicle Overlay Card on Map */}
                    {selectedVehicle && (
                        <div className="absolute top-4 right-4 z-20 w-72 rounded-2xl glass p-4 border border-primary/40 shadow-2xl space-y-2 animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-base text-foreground">{selectedVehicle.vehicle_id}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${statusConfig[selectedVehicle.status]?.badge}`}>
                                        {statusConfig[selectedVehicle.status]?.label}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedVehicle(null)}
                                    className="h-6 w-6 rounded-lg text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="text-xs text-muted-foreground">
                                {selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.year})
                            </div>

                            {selectedVehicle.location_name && (
                                <div className="flex items-center gap-1.5 text-xs text-sky-400 font-medium">
                                    <MapPin className="h-3.5 w-3.5 shrink-0 text-sky-400" />
                                    <span className="truncate">{selectedVehicle.location_name}</span>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/50 text-xs">
                                <div>
                                    <span className="text-[10px] text-muted-foreground block">Battery SoC</span>
                                    <span className={`font-bold ${selectedVehicle.soc > 20 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {selectedVehicle.soc}%
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-muted-foreground block">Speed</span>
                                    <span className="font-bold text-sky-400">{selectedVehicle.speed_kmh} km/h</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-muted-foreground block">Driver</span>
                                    <span className="font-semibold text-foreground truncate block">{selectedVehicle.driver_name}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-muted-foreground block">Range</span>
                                    <span className="font-semibold text-foreground">{selectedVehicle.range_km} km</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => navigate({ to: "/app/routes" })}
                                className="w-full mt-2 flex items-center justify-center gap-1.5 rounded-xl bg-primary/20 hover:bg-primary/30 text-primary py-2 text-xs font-semibold transition cursor-pointer"
                            >
                                <ArrowUpRight className="h-3.5 w-3.5" /> Plan Route for this EV
                            </button>
                        </div>
                    )}
                </div>

                {/* Right Side: Vehicle Directory & Search & Filter */}
                <div className={`glass flex flex-col justify-between rounded-2xl p-4 space-y-3.5 ${isFullscreen ? "h-full" : "h-[70vh] min-h-[500px]"}`}>
                    {/* Header, Search & Filter Controls */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="font-display text-base font-semibold flex items-center gap-2">
                                <Car className="h-4 w-4 text-primary" /> Vehicle Fleet Directory
                            </h3>
                            <span className="text-xs font-semibold text-muted-foreground">
                                {filteredVehicles.length} of {vehicles.length}
                            </span>
                        </div>

                        {/* Search Input */}
                        <div className="flex items-center rounded-xl border border-border bg-card/60 px-3 focus-within:border-primary/60">
                            <Search className="h-3.5 w-3.5 text-muted-foreground mr-2 shrink-0" />
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by ID, Driver, Model, VIN..."
                                className="w-full bg-transparent py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                            />
                            {searchQuery && (
                                <button type="button" onClick={() => setSearchQuery("")} className="text-xs text-muted-foreground hover:text-foreground">
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Status Filter Chips */}
                        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                            {[
                                { id: "all", label: "All" },
                                { id: "active", label: "On Road" },
                                { id: "charging", label: "Charging" },
                                { id: "garage", label: "Garage" },
                                { id: "maintenance", label: "Maint" },
                                { id: "offline", label: "Offline" },
                            ].map((f) => (
                                <button
                                    key={f.id}
                                    type="button"
                                    onClick={() => setStatusFilter(f.id)}
                                    className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium transition cursor-pointer ${
                                        statusFilter === f.id
                                            ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                                            : "border border-border/70 bg-card/40 text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Scrollable Vehicle Cards List */}
                    <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                        {filteredVehicles.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-48 text-center p-4">
                                <Car className="h-8 w-8 text-muted-foreground/50 mb-2" />
                                <span className="text-sm font-semibold text-muted-foreground">No vehicles found</span>
                                <span className="text-xs text-muted-foreground/80 mt-1">Try adjusting your search or filters</span>
                            </div>
                        ) : (
                            filteredVehicles.map((v) => {
                                const isSelected = selectedVehicle?.vehicle_id === v.vehicle_id;
                                const cfg = statusConfig[v.status] || statusConfig.active;
                                return (
                                    <div
                                        key={v.vehicle_id}
                                        onClick={() => handleInspectVehicle(v)}
                                        className={`p-3 rounded-xl border transition cursor-pointer flex flex-col justify-between gap-2 ${
                                            isSelected
                                                ? "border-primary bg-primary/10 shadow-lg"
                                                : "border-border/70 bg-card/30 hover:border-border hover:bg-card/50"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className={`h-2.5 w-2.5 rounded-full ${cfg.dot}`} />
                                                <span className="font-bold text-sm text-foreground">{v.vehicle_id}</span>
                                                <span className="text-xs text-muted-foreground truncate max-w-[110px]">
                                                    {v.make} {v.model}
                                                </span>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${cfg.badge}`}>
                                                {cfg.label}
                                            </span>
                                        </div>

                                        {/* Battery Bar & Metrics */}
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-muted-foreground flex items-center gap-1">
                                                    <BatteryCharging className="h-3 w-3" /> SoC: <b>{v.soc}%</b>
                                                </span>
                                                <span className="text-muted-foreground flex items-center gap-1">
                                                    <Gauge className="h-3 w-3" /> <b>{v.speed_kmh} km/h</b>
                                                </span>
                                            </div>
                                            <div className="h-1.5 w-full rounded-full bg-border/40 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-300 ${
                                                        v.soc > 40
                                                            ? "bg-emerald-400"
                                                            : v.soc > 20
                                                            ? "bg-amber-400"
                                                            : "bg-rose-500"
                                                    }`}
                                                    style={{ width: `${v.soc}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/40 pt-1.5">
                                            <span className="flex items-center gap-1 text-sky-400 font-medium truncate max-w-[130px]" title={v.location_name}>
                                                <MapPin className="h-3 w-3 shrink-0 text-sky-400" /> {v.hub_city || 'India'}
                                            </span>
                                            <span className="flex items-center gap-1 truncate max-w-[110px]" title={v.driver_name}>
                                                <User className="h-3 w-3 text-muted-foreground/70 shrink-0" /> {v.driver_name}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Telemetry Details & Alert Stream Grid */}
            <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
                {/* Selected Vehicle Comprehensive Inspector */}
                {selectedVehicle ? (
                    <div className="glass rounded-2xl p-5 space-y-4">
                        <div className="flex items-center justify-between border-b border-border/60 pb-3">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-display text-lg font-bold text-foreground">
                                        {selectedVehicle.vehicle_id} Telemetry Inspector
                                    </h3>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border ${statusConfig[selectedVehicle.status]?.badge}`}>
                                        {statusConfig[selectedVehicle.status]?.label}
                                    </span>
                                </div>
                                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
                                    <span>{selectedVehicle.make} {selectedVehicle.model}</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1 text-sky-400 font-medium">
                                        <MapPin className="h-3 w-3" /> {selectedVehicle.location_name || 'India'}
                                    </span>
                                    {selectedVehicle.hub_name && (
                                        <span className="text-[10px] bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded-full border border-sky-500/20">
                                            {selectedVehicle.hub_name}
                                        </span>
                                    )}
                                    <span>•</span>
                                    <span>VIN: <span className="font-mono text-foreground">{selectedVehicle.vin}</span></span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => handleInspectVehicle(selectedVehicle)}
                                className="flex items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 text-xs font-semibold transition cursor-pointer"
                            >
                                <MapPin className="h-3.5 w-3.5" /> Re-Center on Map
                            </button>
                        </div>

                        {/* Metric Gauges Grid */}
                        <div className="grid gap-3 sm:grid-cols-4">
                            <div className="glass rounded-xl p-3 border border-border/60">
                                <span className="text-[11px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
                                    <BatteryCharging className="h-3.5 w-3.5 text-emerald-400" /> State of Charge
                                </span>
                                <div className="mt-1 text-2xl font-bold font-display text-emerald-400">{selectedVehicle.soc}%</div>
                                <div className="text-[11px] text-muted-foreground">Range: ~{selectedVehicle.range_km} km</div>
                            </div>

                            <div className="glass rounded-xl p-3 border border-border/60">
                                <span className="text-[11px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
                                    <Gauge className="h-3.5 w-3.5 text-sky-400" /> Live Velocity
                                </span>
                                <div className="mt-1 text-2xl font-bold font-display text-sky-400">{selectedVehicle.speed_kmh} <span className="text-xs font-normal">km/h</span></div>
                                <div className="text-[11px] text-muted-foreground">Heading: {selectedVehicle.heading_deg}°</div>
                            </div>

                            <div className="glass rounded-xl p-3 border border-border/60">
                                <span className="text-[11px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
                                    <Thermometer className="h-3.5 w-3.5 text-amber-400" /> Battery Temp
                                </span>
                                <div className="mt-1 text-2xl font-bold font-display text-amber-400">{selectedVehicle.temperature_celsius}°C</div>
                                <div className="text-[11px] text-muted-foreground">Optimal Thermal Zone</div>
                            </div>

                            <div className="glass rounded-xl p-3 border border-border/60">
                                <span className="text-[11px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
                                    <Compass className="h-3.5 w-3.5 text-violet-400" /> Battery Health
                                </span>
                                <div className="mt-1 text-2xl font-bold font-display text-violet-400">{selectedVehicle.soh}% SoH</div>
                                <div className="text-[11px] text-muted-foreground">Capacity: {selectedVehicle.battery_capacity} kWh</div>
                            </div>
                        </div>

                        {/* Driver & Action Shortcuts */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1 border-t border-border/40">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                    {selectedVehicle.driver_name.charAt(0)}
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground">Assigned Operator</div>
                                    <div className="text-sm font-semibold text-foreground">{selectedVehicle.driver_name}</div>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => navigate({ to: "/app/routes" })}
                                    className="flex items-center gap-1.5 rounded-xl bg-primary text-primary-foreground px-3.5 py-2 text-xs font-semibold hover:opacity-95 transition cursor-pointer shadow-md"
                                >
                                    <Navigation className="h-3.5 w-3.5" /> Plan Route
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate({ to: "/app/battery" })}
                                    className="flex items-center gap-1.5 rounded-xl border border-border bg-card/60 px-3 py-2 text-xs font-semibold text-foreground hover:bg-card transition cursor-pointer"
                                >
                                    <BatteryCharging className="h-3.5 w-3.5 text-primary" /> Battery Diagnostics
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate({ to: "/app/maintenance" })}
                                    className="flex items-center gap-1.5 rounded-xl border border-border bg-card/60 px-3 py-2 text-xs font-semibold text-foreground hover:bg-card transition cursor-pointer"
                                >
                                    <Wrench className="h-3.5 w-3.5 text-amber-400" /> Maintenance
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="glass rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-2 border border-dashed border-border/80">
                        <Navigation className="h-10 w-10 text-primary/40 animate-pulse" />
                        <h4 className="font-semibold text-base text-foreground">Select a vehicle from the map or list</h4>
                        <p className="text-xs text-muted-foreground max-w-sm">
                            Click any moving vehicle marker or list item to view real-time state of charge, thermal profiles, and dispatch options.
                        </p>
                    </div>
                )}

                {/* Live Fleet Alert Stream */}
                <div className="glass rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="font-display text-base font-semibold flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-400" /> Live Fleet Alerts
                        </h3>
                        <span className="rounded-full bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 text-[10px] font-bold text-rose-400">
                            {alertsList.filter((a) => a.type === "critical").length} Critical
                        </span>
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                        {alertsList.length === 0 ? (
                            <div className="text-center py-8 text-xs text-muted-foreground">
                                ✓ All fleet systems operating within normal thresholds.
                            </div>
                        ) : (
                            alertsList.map((alert) => (
                                <div
                                    key={alert.id}
                                    className="p-3 rounded-xl border border-border/70 bg-card/30 hover:bg-card/50 transition flex items-start gap-2.5"
                                >
                                    <span
                                        className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                                            alert.type === "critical"
                                                ? "bg-rose-500 animate-ping"
                                                : alert.type === "warning"
                                                ? "bg-amber-400"
                                                : "bg-sky-400"
                                        }`}
                                    />
                                    <div className="min-w-0 flex-1">
                                        <div className="text-xs font-semibold text-foreground truncate">{alert.title}</div>
                                        <div className="mt-0.5 flex items-center justify-between text-[11px] text-muted-foreground">
                                            <span>{alert.vehicle || alert.vehicle_id || "Fleet Unit"}</span>
                                            <span>{alert.time}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

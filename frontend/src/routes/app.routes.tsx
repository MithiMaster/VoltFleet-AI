import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import {
    MapPin,
    Navigation,
    Plug,
    Sparkles,
    Loader2,
    ArrowLeftRight,
    Globe,
    Compass,
    Zap,
    BatteryCharging,
    Clock,
    Gauge,
    Layers,
    Search,
    Maximize2,
    CheckCircle2
} from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
    WORLD_COUNTRIES,
    POPULAR_EV_CORRIDORS,
    EVCorridorPreset
} from "@/lib/world-cities";

export const Route = createFileRoute("/app/routes")({
    head: () => ({ meta: [{ title: "Global Route Optimization — VoltFleet AI" }] }),
    component: Routes,
});

const API_BASE = "http://localhost:8000";

function Routes() {
    const { token } = useAuth();

    // Mode: 'directory' (Country & City dropdowns) | 'custom' (Freeform global search)
    const [mode, setMode] = useState<"directory" | "custom">("directory");

    // Directory Mode Selections
    const [startCountry, setStartCountry] = useState<string>("India");
    const [startCity, setStartCity] = useState<string>("Mumbai");
    const [destCountry, setDestCountry] = useState<string>("India");
    const [destCity, setDestCity] = useState<string>("Pune");

    // Custom Search Mode Inputs
    const [customStart, setCustomStart] = useState<string>("Mumbai, India");
    const [customDest, setCustomDest] = useState<string>("Pune, India");

    // Preferences & Settings
    const [chargerPreference, setChargerPreference] = useState<string>("150 kW DCFC");
    const [unit, setUnit] = useState<"km" | "miles">("km");
    const [tileStyle, setTileStyle] = useState<"dark" | "streets">("dark");

    // Map & Layer references
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markersLayerRef = useRef<L.LayerGroup | null>(null);
    const routePolylineRef = useRef<L.Polyline | null>(null);
    const glowPolylineRef = useRef<L.Polyline | null>(null);
    const tileLayerRef = useRef<L.TileLayer | null>(null);

    // API state
    const [optimizing, setOptimizing] = useState<boolean>(false);
    const [results, setResults] = useState<any>(null);
    const [mapReady, setMapReady] = useState<boolean>(false);

    // Filter cities based on selected countries
    const startCountryData = useMemo(() => {
        return WORLD_COUNTRIES.find((c) => c.name === startCountry) || WORLD_COUNTRIES[0];
    }, [startCountry]);

    const destCountryData = useMemo(() => {
        return WORLD_COUNTRIES.find((c) => c.name === destCountry) || WORLD_COUNTRIES[0];
    }, [destCountry]);

    // Ensure start city exists in selected country
    useEffect(() => {
        if (startCountryData && !startCountryData.cities.some((c) => c.name === startCity)) {
            setStartCity(startCountryData.cities[0]?.name || "");
        }
    }, [startCountryData, startCity]);

    // Ensure destination city exists in selected country
    useEffect(() => {
        if (destCountryData && !destCountryData.cities.some((c) => c.name === destCity)) {
            setDestCity(destCountryData.cities[1]?.name || destCountryData.cities[0]?.name || "");
        }
    }, [destCountryData, destCity]);

    // Initialize Leaflet Map
    useEffect(() => {
        if (!mapContainerRef.current || mapInstanceRef.current) return;

        // Initialize Map
        const map = L.map(mapContainerRef.current, {
            zoomControl: false,
            attributionControl: true,
            worldCopyJump: true,
            minZoom: 2,
            maxZoom: 19
        }).setView([19.0760, 72.8777], 6);

        // Free OpenStreetMap tile layer (100% open source, NO API KEY required)
        const osmUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

        const tileLayer = L.tileLayer(osmUrl, {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
            subdomains: ["a", "b", "c"],
            maxZoom: 19
        }).addTo(map);

        tileLayerRef.current = tileLayer;

        L.control.zoom({ position: "topright" }).addTo(map);

        const markers = L.layerGroup().addTo(map);
        markersLayerRef.current = markers;
        mapInstanceRef.current = map;
        setMapReady(true);

        // Ensure Leaflet recalculates dimensions properly
        const resizeObserver = new ResizeObserver(() => {
            map.invalidateSize();
        });
        resizeObserver.observe(mapContainerRef.current);

        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 150);

        return () => {
            clearTimeout(timer);
            resizeObserver.disconnect();
            map.remove();
            mapInstanceRef.current = null;
        };
    }, []);

    // Tile style is handled reactively via CSS filters on standard OpenStreetMap tiles (100% free, zero API key)

    // Helper: Swap Origin and Destination
    const handleSwapLocations = () => {
        if (mode === "directory") {
            const prevCountry = startCountry;
            const prevCity = startCity;
            setStartCountry(destCountry);
            setStartCity(destCity);
            setDestCountry(prevCountry);
            setDestCity(prevCity);
        } else {
            const prevStart = customStart;
            setCustomStart(customDest);
            setCustomDest(prevStart);
        }
        toast.info("Swapped origin and destination");
    };

    // Lookup pre-resolved coords from world cities
    const findCityCoords = (countryName: string, cityName: string): [number, number] | null => {
        const c = WORLD_COUNTRIES.find((x) => x.name === countryName);
        if (c) {
            const city = c.cities.find((x) => x.name === cityName);
            if (city) return [city.lat, city.lng];
        }
        return null;
    };

    // Helper: Select Popular Preset Corridor
    const handleSelectPreset = (preset: EVCorridorPreset) => {
        setMode("directory");
        setStartCountry(preset.country);
        setStartCity(preset.startCity);
        setDestCountry(preset.country);
        setDestCity(preset.destCity);
        // Trigger optimization with the selected preset
        executeOptimization({
            start: `${preset.startCity}, ${preset.country}`,
            destination: `${preset.destCity}, ${preset.country}`,
            startCoords: findCityCoords(preset.country, preset.startCity),
            destCoords: findCityCoords(preset.country, preset.destCity)
        });
    };

    // Execute Optimization
    const executeOptimization = async (override?: {
        start: string;
        destination: string;
        startCoords?: [number, number] | null;
        destCoords?: [number, number] | null;
    }) => {
        if (!token) {
            toast.error("Authentication required. Please sign in.");
            return;
        }

        let startQuery = "";
        let destQuery = "";
        let startCoordinates: [number, number] | null = null;
        let destCoordinates: [number, number] | null = null;

        if (override) {
            startQuery = override.start;
            destQuery = override.destination;
            startCoordinates = override.startCoords || null;
            destCoordinates = override.destCoords || null;
        } else if (mode === "directory") {
            startQuery = `${startCity}, ${startCountry}`;
            destQuery = `${destCity}, ${destCountry}`;
            startCoordinates = findCityCoords(startCountry, startCity);
            destCoordinates = findCityCoords(destCountry, destCity);
        } else {
            startQuery = customStart.trim();
            destQuery = customDest.trim();
            if (!startQuery || !destQuery) {
                toast.error("Please enter both origin and destination locations");
                return;
            }
        }

        setOptimizing(true);
        try {
            const payload: any = {
                start: startQuery,
                destination: destQuery,
                charger_preference: chargerPreference
            };
            if (startCoordinates) payload.start_coords = startCoordinates;
            if (destCoordinates) payload.dest_coords = destCoordinates;

            const res = await fetch(`${API_BASE}/api/routes/optimize`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.detail || "Failed to calculate optimized route.");
            }

            const data = await res.json();
            setResults(data);

            // Render route and markers on Leaflet map
            const map = mapInstanceRef.current;
            const markersGroup = markersLayerRef.current;

            if (map && markersGroup) {
                // Clear previous layers
                markersGroup.clearLayers();
                if (glowPolylineRef.current) {
                    map.removeLayer(glowPolylineRef.current);
                }
                if (routePolylineRef.current) {
                    map.removeLayer(routePolylineRef.current);
                }

                // 1. Origin Marker (A)
                const startMarker = L.marker(data.start_coords, {
                    icon: L.divIcon({
                        className: "custom-map-pin-origin",
                        html: `
                            <div class="relative flex items-center justify-center cursor-pointer">
                                <div class="absolute -inset-1.5 rounded-full bg-violet-500/40 animate-ping"></div>
                                <div class="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 text-white font-black text-sm shadow-xl border-2 border-white ring-2 ring-violet-500/50">
                                    A
                                </div>
                            </div>
                        `,
                        iconSize: [36, 36],
                        iconAnchor: [18, 18],
                        popupAnchor: [0, -20]
                    })
                }).addTo(markersGroup);

                startMarker.bindPopup(`
                    <div style="color: #111; font-family: sans-serif; padding: 2px;">
                        <div style="font-weight: 700; color: #6d28d9; font-size: 13px;">ORIGIN (START)</div>
                        <div style="font-size: 14px; font-weight: 600; margin-top: 2px;">${data.start_name}</div>
                        <div style="font-size: 11px; color: #666; margin-top: 4px;">Lat: ${data.start_coords[0]}, Lng: ${data.start_coords[1]}</div>
                    </div>
                `);

                // 2. Destination Marker (B)
                const destMarker = L.marker(data.dest_coords, {
                    icon: L.divIcon({
                        className: "custom-map-pin-dest",
                        html: `
                            <div class="relative flex items-center justify-center cursor-pointer">
                                <div class="absolute -inset-1.5 rounded-full bg-emerald-500/40 animate-ping"></div>
                                <div class="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 text-white font-black text-sm shadow-xl border-2 border-white ring-2 ring-emerald-500/50">
                                    B
                                </div>
                            </div>
                        `,
                        iconSize: [36, 36],
                        iconAnchor: [18, 18],
                        popupAnchor: [0, -20]
                    })
                }).addTo(markersGroup);

                destMarker.bindPopup(`
                    <div style="color: #111; font-family: sans-serif; padding: 2px;">
                        <div style="font-weight: 700; color: #059669; font-size: 13px;">DESTINATION</div>
                        <div style="font-size: 14px; font-weight: 600; margin-top: 2px;">${data.destination_name}</div>
                        <div style="font-size: 11px; color: #666; margin-top: 4px;">Lat: ${data.dest_coords[0]}, Lng: ${data.dest_coords[1]}</div>
                    </div>
                `);

                // 3. EV Charging Stop Markers
                if (data.charging_stops && data.charging_stops.length > 0) {
                    data.charging_stops.forEach((stop: any, idx: number) => {
                        const stopMarker = L.marker(stop.coords, {
                            icon: L.divIcon({
                                className: "custom-map-pin-charging",
                                html: `
                                    <div class="relative flex items-center justify-center cursor-pointer group">
                                        <div class="absolute -inset-1 rounded-full bg-amber-400/60 blur-[2px]"></div>
                                        <div class="flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-slate-950 font-black text-xs shadow-xl border-2 border-slate-900 transition-transform group-hover:scale-110">
                                            ⚡
                                        </div>
                                    </div>
                                `,
                                iconSize: [32, 32],
                                iconAnchor: [16, 16],
                                popupAnchor: [0, -18]
                            })
                        }).addTo(markersGroup);

                        stopMarker.bindPopup(`
                            <div style="color: #111; font-family: sans-serif; padding: 2px;">
                                <div style="display: flex; align-items: center; gap: 4px; font-weight: 700; color: #b45309; font-size: 13px;">
                                    ⚡ CHARGING STOP #${idx + 1}
                                </div>
                                <div style="font-size: 14px; font-weight: 600; margin-top: 2px;">${stop.name}</div>
                                <div style="font-size: 12px; margin-top: 4px;">Charge Power: <b>${stop.speed_kw} kW DCFC</b></div>
                                <div style="font-size: 12px;">Charge Time: <b>${stop.wait_mins} mins</b></div>
                                <div style="font-size: 11px; color: #059669; font-weight: 600; margin-top: 2px;">${stop.available_plugs} Ultra-Fast Plugs Available</div>
                            </div>
                        `);
                    });
                }

                // 4. Glow outer polyline
                const glowLine = L.polyline(data.path_coordinates, {
                    color: "#0284c7",
                    weight: 8,
                    opacity: 0.35,
                    lineCap: "round",
                    lineJoin: "round"
                }).addTo(map);
                glowPolylineRef.current = glowLine;

                // 5. Core crisp polyline
                const coreLine = L.polyline(data.path_coordinates, {
                    color: "#38bdf8",
                    weight: 4.5,
                    opacity: 0.95,
                    lineCap: "round",
                    lineJoin: "round"
                }).addTo(map);
                routePolylineRef.current = coreLine;

                // Auto fit bounds to show the entire route smoothly
                map.fitBounds(coreLine.getBounds(), {
                    padding: [60, 60],
                    maxZoom: 13,
                    animate: true
                });
            }

            toast.success(`Route optimized: ${data.start_name} → ${data.destination_name}`);
        } catch (err: any) {
            console.error("Optimization error:", err);
            toast.error(err.message || "Failed to optimize route. Please verify locations.");
        } finally {
            setOptimizing(false);
        }
    };

    // Form submit handler
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        executeOptimization();
    };

    // Auto-run default route on initial mount once map and token are available
    useEffect(() => {
        if (mapReady && token && !results) {
            executeOptimization();
        }
    }, [mapReady, token]);

    // Helper to zoom in on a specific charging stop
    const handleFocusStop = (stop: any) => {
        const map = mapInstanceRef.current;
        if (map && stop.coords) {
            map.setView(stop.coords, 14, { animate: true });
        }
    };

    // Helper to reset map to entire route bounds
    const handleResetBounds = () => {
        const map = mapInstanceRef.current;
        const line = routePolylineRef.current;
        if (map && line) {
            map.fitBounds(line.getBounds(), { padding: [60, 60], animate: true });
        } else if (map) {
            map.setView([20.0, 0.0], 2, { animate: true });
        }
    };

    return (
        <div className="space-y-5 text-foreground">
            <PageHeader
                title="Global Route Optimization"
                subtitle="Worldwide AI-driven routing with terrain elevation modeling, battery thermal curves, and dynamic fast-charging schedules."
            />

            {/* Global styling overrides for Leaflet container and clean popups */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .leaflet-container {
                    background: #09090b !important;
                    font-family: inherit;
                    width: 100% !important;
                    height: 100% !important;
                    z-index: 10;
                }
                .leaflet-tile {
                    filter: ${tileStyle === "dark" ? "invert(100%) hue-rotate(180deg) brightness(92%) contrast(90%) saturate(0.85)" : "none"} !important;
                    transition: filter 0.3s ease;
                }
                .custom-map-pin-origin, .custom-map-pin-dest, .custom-map-pin-charging {
                    background: transparent !important;
                    border: none !important;
                }
                .leaflet-popup-content-wrapper {
                    background: #ffffff !important;
                    border-radius: 12px !important;
                    box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.5), 0 8px 10px -6px rgb(0 0 0 / 0.5) !important;
                    border: 1px solid rgba(0,0,0,0.1) !important;
                }
                .leaflet-popup-tip {
                    background: #ffffff !important;
                }
            `}} />

            {/* Popular Global EV Corridors Quick-Select Bar */}
            <div className="glass rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <Compass className="h-3.5 w-3.5 text-primary" /> Popular Global EV Corridors
                    </span>
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                        Click any corridor to instantly route & optimize
                    </span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                    {POPULAR_EV_CORRIDORS.map((preset) => (
                        <button
                            key={preset.title}
                            type="button"
                            onClick={() => handleSelectPreset(preset)}
                            className="flex shrink-0 items-center gap-1.5 rounded-xl border border-border/80 bg-card/40 px-3 py-1.5 text-xs font-medium text-foreground hover:border-primary/60 hover:bg-primary/10 transition cursor-pointer"
                        >
                            <span>{preset.flag}</span>
                            <span>{preset.title}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Interactive Grid: Controls (1/3) & Global Map (2/3) */}
            <div className="grid gap-4 lg:grid-cols-[1.1fr_2fr]">
                {/* Route Planning Control Panel */}
                <form onSubmit={handleSubmit} className="glass space-y-4 rounded-2xl p-5 flex flex-col justify-between">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-border/60 pb-3">
                            <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                                <Globe className="h-4 w-4 text-primary" /> Plan a route
                            </h3>

                            {/* Mode Toggle: Directory vs Custom Search */}
                            <div className="flex rounded-lg bg-card/60 p-0.5 border border-border">
                                <button
                                    type="button"
                                    onClick={() => setMode("directory")}
                                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition cursor-pointer ${
                                        mode === "directory"
                                            ? "bg-primary text-primary-foreground shadow-sm"
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    City Directory
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMode("custom")}
                                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition cursor-pointer ${
                                        mode === "custom"
                                            ? "bg-primary text-primary-foreground shadow-sm"
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    Custom Search
                                </button>
                            </div>
                        </div>

                        {/* Location Inputs based on selected mode */}
                        {mode === "directory" ? (
                            <div className="space-y-3">
                                {/* Start Point (Origin) */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold text-white">A</span>
                                        Origin Location
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {/* Country Selector */}
                                        <select
                                            value={startCountry}
                                            onChange={(e) => setStartCountry(e.target.value)}
                                            className="auth-input rounded-xl border border-border bg-card/60 px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:border-primary/60 cursor-pointer"
                                        >
                                            {WORLD_COUNTRIES.map((c) => (
                                                <option key={c.name} value={c.name} className="bg-background text-foreground">
                                                    {c.flag} {c.name}
                                                </option>
                                            ))}
                                        </select>

                                        {/* City Selector */}
                                        <select
                                            value={startCity}
                                            onChange={(e) => setStartCity(e.target.value)}
                                            className="auth-input rounded-xl border border-border bg-card/60 px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:border-primary/60 cursor-pointer"
                                        >
                                            {startCountryData.cities.map((city) => (
                                                <option key={city.name} value={city.name} className="bg-background text-foreground">
                                                    {city.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Swap Button */}
                                <div className="flex justify-center -my-1">
                                    <button
                                        type="button"
                                        onClick={handleSwapLocations}
                                        title="Swap Start & Destination"
                                        className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card/80 text-muted-foreground hover:text-primary hover:border-primary/50 transition cursor-pointer shadow-sm hover:rotate-180 duration-300"
                                    >
                                        <ArrowLeftRight className="h-3.5 w-3.5" />
                                    </button>
                                </div>

                                {/* Destination Point */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">B</span>
                                        Destination Location
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {/* Country Selector */}
                                        <select
                                            value={destCountry}
                                            onChange={(e) => setDestCountry(e.target.value)}
                                            className="auth-input rounded-xl border border-border bg-card/60 px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:border-primary/60 cursor-pointer"
                                        >
                                            {WORLD_COUNTRIES.map((c) => (
                                                <option key={c.name} value={c.name} className="bg-background text-foreground">
                                                    {c.flag} {c.name}
                                                </option>
                                            ))}
                                        </select>

                                        {/* City Selector */}
                                        <select
                                            value={destCity}
                                            onChange={(e) => setDestCity(e.target.value)}
                                            className="auth-input rounded-xl border border-border bg-card/60 px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:border-primary/60 cursor-pointer"
                                        >
                                            {destCountryData.cities.map((city) => (
                                                <option key={city.name} value={city.name} className="bg-background text-foreground">
                                                    {city.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Custom Global Search Mode */
                            <div className="space-y-3">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                                        <MapPin className="h-3.5 w-3.5 text-violet-500" />
                                        Custom Origin (Address or Place Worldwide)
                                    </label>
                                    <div className="flex items-center rounded-xl border border-border bg-card/60 px-3 focus-within:border-primary/60">
                                        <input
                                            required
                                            value={customStart}
                                            onChange={(e) => setCustomStart(e.target.value)}
                                            placeholder="e.g. Heathrow Airport, London or Shibuya, Tokyo"
                                            className="auth-input w-full bg-transparent py-2.5 text-xs text-foreground focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-center -my-1">
                                    <button
                                        type="button"
                                        onClick={handleSwapLocations}
                                        title="Swap Start & Destination"
                                        className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card/80 text-muted-foreground hover:text-primary hover:border-primary/50 transition cursor-pointer shadow-sm hover:rotate-180 duration-300"
                                    >
                                        <ArrowLeftRight className="h-3.5 w-3.5" />
                                    </button>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                                        <Navigation className="h-3.5 w-3.5 text-emerald-500" />
                                        Custom Destination (Address or Place Worldwide)
                                    </label>
                                    <div className="flex items-center rounded-xl border border-border bg-card/60 px-3 focus-within:border-primary/60">
                                        <input
                                            required
                                            value={customDest}
                                            onChange={(e) => setCustomDest(e.target.value)}
                                            placeholder="e.g. Cambridge Science Park or Munich Central"
                                            className="auth-input w-full bg-transparent py-2.5 text-xs text-foreground focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Charger Preference & Unit Toggle */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                                    <Plug className="h-3 w-3 text-primary" /> Charger Standard
                                </label>
                                <select
                                    value={chargerPreference}
                                    onChange={(e) => setChargerPreference(e.target.value)}
                                    className="auth-input w-full rounded-xl border border-border bg-card/60 px-2.5 py-2 text-xs text-foreground focus:outline-none focus:border-primary/60 cursor-pointer"
                                >
                                    <option value="150 kW DCFC" className="bg-background">150 kW DC Fast (Standard)</option>
                                    <option value="350 kW Ultra-Fast" className="bg-background">350 kW Ultra-Fast HyperCharge</option>
                                    <option value="50 kW DCFC" className="bg-background">50 kW DC Quick Charger</option>
                                    <option value="22 kW AC Level 2" className="bg-background">22 kW AC Destination</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                                    <Gauge className="h-3 w-3 text-secondary" /> Distance Unit
                                </label>
                                <div className="grid grid-cols-2 gap-1 rounded-xl bg-card/60 p-1 border border-border">
                                    <button
                                        type="button"
                                        onClick={() => setUnit("km")}
                                        className={`rounded-lg py-1 text-xs font-medium transition cursor-pointer ${
                                            unit === "km"
                                                ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                                                : "text-muted-foreground hover:text-foreground"
                                        }`}
                                    >
                                        Kilometers
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setUnit("miles")}
                                        className={`rounded-lg py-1 text-xs font-medium transition cursor-pointer ${
                                            unit === "miles"
                                                ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                                                : "text-muted-foreground hover:text-foreground"
                                        }`}
                                    >
                                        Miles
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={optimizing}
                            className="w-full flex items-center justify-center gap-2 cursor-pointer rounded-xl bg-gradient-to-r from-primary to-secondary py-3 text-sm font-semibold text-background hover:opacity-95 transition disabled:opacity-50 shadow-lg shadow-primary/20"
                        >
                            {optimizing ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Optimizing Global Path...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-4 w-4" />
                                    Optimize Route
                                </>
                            )}
                        </button>
                    </div>

                    {/* AI Recommendation Summary Box */}
                    {results && (
                        <div className="mt-3 rounded-xl border border-primary/30 bg-primary/5 p-3.5 text-xs space-y-1.5">
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1.5 text-primary font-bold">
                                    <Sparkles className="h-3.5 w-3.5" /> AI Optimal Dispatch
                                </span>
                                <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold text-primary">
                                    {results.traffic}
                                </span>
                            </div>
                            <div className="font-medium text-foreground">
                                {results.start_name} → {results.destination_name}
                            </div>
                            <div className="text-muted-foreground">
                                {results.charging_stops.length > 0 ? (
                                    <span>
                                        Route requires <b className="text-amber-400">{results.charging_stops.length} fast charging stops</b> for battery health preservation.
                                    </span>
                                ) : (
                                    <span className="text-emerald-400 font-medium">
                                        ✓ Direct non-stop journey within standard single-charge range.
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </form>

                {/* Map Display Card with Controls & Overlays */}
                <div className="glass relative flex flex-col h-[65vh] min-h-[460px] overflow-hidden rounded-2xl p-2.5">
                    {/* Floating Map Controls Header */}
                    <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                        {/* Tile Layer Toggle */}
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

                        {/* Reset Bounds Button */}
                        <button
                            type="button"
                            onClick={handleResetBounds}
                            title="Fit Route on Map"
                            className="flex items-center gap-1 rounded-xl bg-card/90 backdrop-blur-md px-2.5 py-1.5 text-xs font-semibold text-foreground border border-border shadow-lg hover:border-primary/50 transition cursor-pointer"
                        >
                            <Maximize2 className="h-3.5 w-3.5 text-primary" /> Fit Route
                        </button>
                    </div>

                    {/* Leaflet Map Canvas */}
                    <div ref={mapContainerRef} className="h-full w-full rounded-xl overflow-hidden" />

                    {/* Loading Overlay */}
                    {optimizing && (
                        <div className="absolute inset-2 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-xl z-30">
                            <div className="flex flex-col items-center gap-2 glass px-5 py-4 rounded-2xl border border-primary/30 shadow-2xl">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <span className="text-sm font-semibold text-foreground">Computing worldwide road geometry...</span>
                                <span className="text-xs text-muted-foreground">Calculating elevation profile and fast chargers</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* KPI Performance Metrics Grid */}
            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
                {[
                    {
                        icon: Gauge,
                        color: "text-sky-400",
                        l: "Total Distance",
                        v: results
                            ? unit === "km"
                                ? `${results.distance_km} km`
                                : `${results.distance_miles} miles`
                            : "—",
                        sub: results
                            ? unit === "km"
                                ? `(${results.distance_miles} mi)`
                                : `(${results.distance_km} km)`
                            : "Calculated via OSRM"
                    },
                    {
                        icon: Clock,
                        color: "text-violet-400",
                        l: "Estimated Duration",
                        v: results ? results.duration_formatted : "—",
                        sub: results ? `Traffic: ${results.traffic}` : "Driving + Stops"
                    },
                    {
                        icon: Zap,
                        color: "text-amber-400",
                        l: "Energy Consumption",
                        v: results ? `${results.energy_kwh} kWh` : "—",
                        sub: results ? `~0.19 kWh / km` : "Fleet EV powertrain"
                    },
                    {
                        icon: BatteryCharging,
                        color: "text-emerald-400",
                        l: "Battery Depletion",
                        v: results ? `${results.battery_usage_pct}%` : "—",
                        sub: results ? (results.battery_usage_pct > 100 ? "Requires recharges" : "Within 1 full pack") : "Standard 75 kWh pack"
                    },
                    {
                        icon: Compass,
                        color: "text-teal-400",
                        l: "Terrain & Elevation",
                        v: results ? `+${results.elevation_impact_pct}%` : "—",
                        sub: "Grade drag compensation"
                    }
                ].map((m) => {
                    const Icon = m.icon;
                    return (
                        <div key={m.l} className="glass rounded-2xl p-4 flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{m.l}</span>
                                <Icon className={`h-4 w-4 ${m.color}`} />
                            </div>
                            <div className="mt-2 font-display text-2xl font-bold text-foreground">{m.v}</div>
                            <div className="mt-1 text-[11px] text-muted-foreground">{m.sub}</div>
                        </div>
                    );
                })}
            </div>

            {/* Detailed EV Charging Schedule Table / Cards */}
            {results && results.charging_stops && results.charging_stops.length > 0 ? (
                <div className="glass rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-display text-base font-semibold flex items-center gap-2 text-foreground">
                            <Plug className="h-4 w-4 text-amber-400" /> Optimal EV Fast-Charging Schedule
                        </h3>
                        <span className="text-xs text-muted-foreground">
                            {results.charging_stops.length} designated corridor stop(s)
                        </span>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                        {results.charging_stops.map((stop: any, idx: number) => (
                            <div
                                key={idx}
                                className="flex items-center justify-between p-3.5 rounded-xl border border-border/80 bg-card/40 hover:border-amber-400/40 transition group"
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs">
                                            {idx + 1}
                                        </span>
                                        <div className="font-semibold text-sm text-foreground">{stop.name}</div>
                                    </div>
                                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                                        <span>Rate: <b>{stop.speed_kw} kW DCFC</b></span>
                                        <span>•</span>
                                        <span className="text-emerald-400 font-medium">{stop.available_plugs} plugs free</span>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-1.5">
                                    <div className="text-right">
                                        <div className="text-[10px] text-muted-foreground uppercase font-semibold">Charge Time</div>
                                        <div className="text-sm font-bold text-amber-400">{stop.wait_mins} mins</div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleFocusStop(stop)}
                                        className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                                    >
                                        <Search className="h-3 w-3" /> Focus on Map
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : results ? (
                <div className="glass rounded-2xl p-4 flex items-center gap-3 border border-emerald-500/20 bg-emerald-500/5">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                    <div>
                        <div className="text-sm font-semibold text-foreground">Non-Stop EV Journey</div>
                        <div className="text-xs text-muted-foreground">
                            Estimated energy usage is well within vehicle battery capacity. No intermediate charging stops required for this route.
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}

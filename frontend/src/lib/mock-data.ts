// Mock data for VoltFleet AI dashboards

export type VehicleStatus = "active" | "charging" | "garage" | "maintenance" | "offline";

export interface Vehicle {
    id: string;
    name: string;
    make: string;
    model: string;
    year: number;
    batteryCapacity: number; // kWh
    soc: number; // 0-100
    soh: number; // 0-100
    status: VehicleStatus;
    driver: string;
    location: { lat: number; lng: number; city: string };
    lastUpdated: string;
    mileage: number;
    range: number;
    temperature: number;
}

export const vehicles: Vehicle[] = [
    { id: "VF-001", name: "Volt-001", make: "Tesla", model: "Model Y", year: 2024, batteryCapacity: 75, soc: 84, soh: 96, status: "active", driver: "Marcus Chen", location: { lat: 37.78, lng: -122.41, city: "San Francisco" }, lastUpdated: "2m ago", mileage: 28430, range: 312, temperature: 28 },
    { id: "VF-002", name: "Volt-002", make: "Rivian", model: "EDV 700", year: 2023, batteryCapacity: 135, soc: 42, soh: 93, status: "charging", driver: "Sofia Reyes", location: { lat: 37.79, lng: -122.40, city: "San Francisco" }, lastUpdated: "1m ago", mileage: 41280, range: 158, temperature: 32 },
    { id: "VF-003", name: "Volt-003", make: "Ford", model: "E-Transit", year: 2024, batteryCapacity: 89, soc: 18, soh: 88, status: "active", driver: "Daniel Park", location: { lat: 37.77, lng: -122.42, city: "San Francisco" }, lastUpdated: "1m ago", mileage: 52310, range: 64, temperature: 35 },
    { id: "VF-004", name: "Volt-004", make: "Mercedes", model: "eSprinter", year: 2024, batteryCapacity: 113, soc: 67, soh: 91, status: "active", driver: "Aisha Khan", location: { lat: 37.80, lng: -122.39, city: "Oakland" }, lastUpdated: "3m ago", mileage: 19840, range: 254, temperature: 30 },
    { id: "VF-005", name: "Volt-005", make: "BYD", model: "T3", year: 2023, batteryCapacity: 50, soc: 0, soh: 82, status: "maintenance", driver: "—", location: { lat: 37.76, lng: -122.43, city: "Daly City" }, lastUpdated: "1h ago", mileage: 78920, range: 0, temperature: 24 },
    { id: "VF-006", name: "Volt-006", make: "Tesla", model: "Model 3", year: 2024, batteryCapacity: 75, soc: 91, soh: 97, status: "active", driver: "Jonas Weber", location: { lat: 37.81, lng: -122.38, city: "Berkeley" }, lastUpdated: "1m ago", mileage: 12450, range: 348, temperature: 27 },
    { id: "VF-007", name: "Volt-007", make: "Rivian", model: "EDV 500", year: 2023, batteryCapacity: 105, soc: 58, soh: 89, status: "charging", driver: "Priya Patel", location: { lat: 37.78, lng: -122.42, city: "San Francisco" }, lastUpdated: "4m ago", mileage: 38120, range: 198, temperature: 33 },
    { id: "VF-008", name: "Volt-008", make: "Ford", model: "F-150 Lightning", year: 2024, batteryCapacity: 131, soc: 76, soh: 94, status: "active", driver: "Liam Brooks", location: { lat: 37.77, lng: -122.40, city: "San Francisco" }, lastUpdated: "2m ago", mileage: 22310, range: 286, temperature: 29 },
    { id: "VF-009", name: "Volt-009", make: "Mercedes", model: "eSprinter", year: 2023, batteryCapacity: 113, soc: 5, soh: 85, status: "offline", driver: "Yuki Tanaka", location: { lat: 37.79, lng: -122.41, city: "San Francisco" }, lastUpdated: "2h ago", mileage: 64210, range: 12, temperature: 22 },
    { id: "VF-010", name: "Volt-010", make: "BYD", model: "ATTO 3", year: 2024, batteryCapacity: 60, soc: 100, soh: 99, status: "garage", driver: "Elena Rossi", location: { lat: 37.76, lng: -122.44, city: "Daly City" }, lastUpdated: "10m ago", mileage: 4820, range: 312, temperature: 25 },
    { id: "VF-011", name: "Volt-011", make: "Tesla", model: "Model Y", year: 2024, batteryCapacity: 75, soc: 73, soh: 95, status: "active", driver: "Omar Said", location: { lat: 37.80, lng: -122.40, city: "Oakland" }, lastUpdated: "1m ago", mileage: 31040, range: 275, temperature: 28 },
    { id: "VF-012", name: "Volt-012", make: "Rivian", model: "EDV 700", year: 2024, batteryCapacity: 135, soc: 48, soh: 92, status: "active", driver: "Hannah Lee", location: { lat: 37.78, lng: -122.39, city: "Oakland" }, lastUpdated: "1m ago", mileage: 18230, range: 186, temperature: 31 },
];

export interface Driver {
    id: string;
    name: string;
    avatarColor: string;
    group: string;
    trips: number;
    distance: number;
    revenue: number;
    safetyScore: number;
    efficiencyScore: number;
    aiScore: number;
}

export const drivers: Driver[] = [
    { id: "DR-01", name: "Marcus Chen", avatarColor: "from-sky-500 to-emerald-500", group: "North Bay", trips: 142, distance: 8420, revenue: 18420, safetyScore: 94, efficiencyScore: 91, aiScore: 92 },
    { id: "DR-02", name: "Sofia Reyes", avatarColor: "from-emerald-500 to-teal-500", group: "Downtown", trips: 168, distance: 9720, revenue: 21030, safetyScore: 97, efficiencyScore: 95, aiScore: 96 },
    { id: "DR-03", name: "Daniel Park", avatarColor: "from-purple-500 to-sky-500", group: "South Bay", trips: 121, distance: 7210, revenue: 15820, safetyScore: 88, efficiencyScore: 83, aiScore: 85 },
    { id: "DR-04", name: "Aisha Khan", avatarColor: "from-pink-500 to-orange-500", group: "Oakland", trips: 154, distance: 8910, revenue: 19340, safetyScore: 92, efficiencyScore: 89, aiScore: 90 },
    { id: "DR-05", name: "Jonas Weber", avatarColor: "from-amber-500 to-rose-500", group: "Downtown", trips: 138, distance: 8120, revenue: 17630, safetyScore: 90, efficiencyScore: 86, aiScore: 88 },
    { id: "DR-06", name: "Priya Patel", avatarColor: "from-teal-500 to-cyan-500", group: "North Bay", trips: 175, distance: 10240, revenue: 22580, safetyScore: 96, efficiencyScore: 93, aiScore: 94 },
];

export const alerts = [
    { id: 1, vehicle: "VF-003", type: "critical", title: "Low Battery (18%)", time: "2 min ago" },
    { id: 2, vehicle: "VF-009", type: "critical", title: "Vehicle Offline", time: "12 min ago" },
    { id: 3, vehicle: "VF-002", type: "warning", title: "Overspeed Alert — 78 mph", time: "18 min ago" },
    { id: 4, vehicle: "VF-005", type: "warning", title: "Maintenance Due in 2 days", time: "1 hr ago" },
    { id: 5, vehicle: "VF-007", type: "info", title: "Charging started", time: "1 hr ago" },
    { id: 6, vehicle: "VF-001", type: "warning", title: "Battery health degradation +0.4%", time: "3 hr ago" },
    { id: 7, vehicle: "VF-012", type: "info", title: "Route optimized — 12% energy saved", time: "4 hr ago" },
    { id: 8, vehicle: "VF-004", type: "warning", title: "Tire pressure low", time: "5 hr ago" },
] as const;

export const energyTrend = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    energy: Math.round(40 + Math.sin(i / 3) * 18 + Math.random() * 12),
    cost: Math.round(8 + Math.sin(i / 3) * 4 + Math.random() * 3),
}));

export const fleetActivity = Array.from({ length: 7 }, (_, i) => {
    const d = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i];
    return {
        day: d,
        active: 32 + Math.round(Math.random() * 8),
        charging: 6 + Math.round(Math.random() * 4),
        offline: 2 + Math.round(Math.random() * 3),
    };
});

export const batterySocSeries = Array.from({ length: 24 }, (_, i) => ({
    t: `${i}:00`,
    soc: Math.round(20 + Math.abs(Math.sin(i / 4)) * 75),
    temp: Math.round(24 + Math.sin(i / 5) * 6 + Math.random() * 2),
    voltage: +(380 + Math.sin(i / 3) * 8 + Math.random() * 2).toFixed(1),
    current: Math.round(80 + Math.sin(i / 2) * 40),
}));

export const sohSeries = Array.from({ length: 12 }, (_, i) => ({
    month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
    soh: +(100 - i * 0.4 - Math.random() * 0.5).toFixed(1),
}));

export const driverSpeedSeries = Array.from({ length: 12 }, (_, i) => ({
    t: `${i * 5}m`,
    speed: Math.round(35 + Math.sin(i / 2) * 15 + Math.random() * 8),
}));

export const maintenanceItems = [
    { vehicle: "VF-005", task: "Battery cooling system service", due: "in 2 days", status: "critical" as const },
    { vehicle: "VF-003", task: "Tire rotation", due: "in 4 days", status: "warning" as const },
    { vehicle: "VF-009", task: "12V battery replacement", due: "in 6 days", status: "warning" as const },
    { vehicle: "VF-001", task: "Brake pad inspection", due: "in 9 days", status: "healthy" as const },
    { vehicle: "VF-007", task: "Cabin air filter", due: "in 14 days", status: "healthy" as const },
];

export const chargingSchedule = [
    { time: "22:00", station: "Depot A — Charger 1", vehicle: "VF-002", duration: "4h", rate: "150 kW" },
    { time: "22:30", station: "Depot A — Charger 2", vehicle: "VF-007", duration: "3h", rate: "150 kW" },
    { time: "23:00", station: "Depot B — Charger 1", vehicle: "VF-003", duration: "5h", rate: "120 kW" },
    { time: "01:00", station: "Depot A — Charger 3", vehicle: "VF-009", duration: "6h", rate: "100 kW" },
    { time: "03:00", station: "Depot B — Charger 2", vehicle: "VF-005", duration: "4h", rate: "150 kW" },
];

export const kpiTrend = (base: number) =>
    Array.from({ length: 14 }, () => Math.round(base * (0.85 + Math.random() * 0.3)));

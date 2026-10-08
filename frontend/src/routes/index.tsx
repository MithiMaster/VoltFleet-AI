import { createFileRoute, Link } from "@tanstack/react-router";
import {
    Activity, ArrowRight, BatteryCharging, Check, Cpu, Gauge, MapPin,
    Radio, Route as RouteIcon, ShieldCheck, Sparkles, Users, Zap,
} from "lucide-react";
import {
    Area, AreaChart, ResponsiveContainer, Tooltip as RTooltip,
    XAxis, YAxis, CartesianGrid,
} from "recharts";
import { energyTrend, batterySocSeries } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
    head: () => ({
        meta: [
            { title: "VoltFleet AI — Intelligent EV Fleet Monitoring" },
            { name: "description", content: "Monitor battery health, optimize routes, reduce downtime, and maximize fleet efficiency through real-time EV intelligence." },
            { property: "og:title", content: "VoltFleet AI — Intelligent EV Fleet Monitoring" },
            { property: "og:description", content: "Real-time EV fleet monitoring and predictive analytics for commercial electric vehicle fleets." },
        ],
    }),
    component: Landing,
});

function Landing() {
    return (
        <div className="relative overflow-x-hidden">
            <AuroraBg />
            <Nav />
            <Hero />
            <Logos />
            <Features />
            <DashboardPreview />
            <BatteryShowcase />
            <FleetShowcase />
            <Pricing />
            <Testimonials />
            <Contact />
            <Footer />
        </div>
    );
}

function AuroraBg() {
    return (
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
            <div className="absolute -top-40 -left-40 h-[44rem] w-[44rem] rounded-full bg-primary/10 blur-[140px]" />
            <div className="absolute top-1/3 -right-40 h-[40rem] w-[40rem] rounded-full bg-secondary/12 blur-[140px]" />
            <div className="absolute bottom-0 left-1/4 h-[36rem] w-[36rem] rounded-full bg-primary/8 blur-[140px]" />
            <div
                className="absolute inset-0 opacity-[0.035]"
                style={{
                    backgroundImage:
                        "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
                    backgroundSize: "56px 56px",
                    maskImage: "radial-gradient(ellipse at center, black 40%, transparent 75%)",
                }}
            />
        </div>
    );
}

function Nav() {
    return (
        <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                <Link to="/" className="flex items-center gap-2.5 group">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-[var(--shadow-glow)] transition-transform group-hover:scale-105">
                        <Zap className="h-5 w-5 text-background" strokeWidth={2.5} />
                    </div>
                    <span className="font-display text-lg font-bold tracking-tight">
                        VoltFleet <span className="text-primary">AI</span>
                    </span>
                </Link>
                <nav className="hidden items-center gap-9 text-sm font-medium text-muted-foreground md:flex">
                    <a href="#features" className="hover:text-foreground transition-colors">Features</a>
                    <a href="#dashboard" className="hover:text-foreground transition-colors">Platform</a>
                    <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
                    <a href="#contact" className="hover:text-foreground transition-colors">Enterprise</a>
                </nav>
                <div className="flex items-center gap-2">
                    <Link
                        to="/login"
                        className="hidden rounded-full px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground sm:inline-flex"
                    >
                        Sign in
                    </Link>
                    <Link
                        to="/app/dashboard"
                        className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background transition-all hover:bg-primary hover:shadow-[var(--shadow-glow)]"
                    >
                        Launch dashboard <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </div>
            </div>
        </header>
    );
}

function Hero() {
    return (
        <section className="relative px-6 pt-24 pb-20 sm:pt-32">
            <div className="mx-auto max-w-7xl text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-primary">
                    <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                    </span>
                    AI-powered predictive analytics
                </div>

                <h1 className="mx-auto mt-7 max-w-4xl font-display text-5xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl md:text-7xl">
                    Intelligent EV Fleet Monitoring{" "}
                    <span className="bg-gradient-to-r from-primary via-foreground to-secondary bg-clip-text text-transparent">
                        Powered by Predictive Analytics
                    </span>
                </h1>

                <p className="mx-auto mt-7 max-w-2xl text-base text-muted-foreground sm:text-lg">
                    Monitor battery health, optimize routes, reduce downtime, and maximize fleet efficiency
                    through real-time EV intelligence — built for operators that can't afford blind spots.
                </p>

                <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <Link
                        to="/app/dashboard"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-sm font-bold text-primary-foreground shadow-[var(--shadow-glow)] transition-all hover:brightness-110 sm:w-auto"
                    >
                        Launch dashboard <ArrowRight className="h-4 w-4" />
                    </Link>
                    <a
                        href="#dashboard"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-white/5 px-7 py-3.5 text-sm font-semibold text-foreground backdrop-blur hover:bg-white/10 sm:w-auto"
                    >
                        Watch the demo
                    </a>
                </div>

                {/* Hero metric bento */}
                <div className="mx-auto mt-20 grid max-w-6xl grid-cols-1 gap-4 text-left sm:grid-cols-3">
                    <HeroMetric
                        label="Fleet uptime"
                        value="99.4%"
                        accent="text-primary"
                        chip="+1.2% vs last week"
                        bar={99.4}
                    />
                    <HeroMetric
                        label="Vehicles online"
                        value={<>147<span className="text-muted-foreground/70"> / 152</span></>}
                        accent="text-foreground"
                        chip="5 charging"
                        segments
                    />
                    <HeroMetric
                        label="Energy optimized"
                        value="4.8M kWh"
                        accent="text-secondary"
                        chip="+12% efficiency"
                    />
                </div>
            </div>
        </section>
    );
}

function HeroMetric({
    label, value, accent, chip, bar, segments,
}: {
    label: string; value: React.ReactNode; accent: string; chip: string; bar?: number; segments?: boolean;
}) {
    return (
        <div className="glass rounded-3xl p-7">
            <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
            <div className={`mt-2 font-display text-4xl font-bold ${accent}`}>{value}</div>
            {bar !== undefined && (
                <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                    <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${bar}%` }} />
                </div>
            )}
            {segments && (
                <div className="mt-5 flex gap-1">
                    <div className="h-1.5 w-full rounded-full bg-primary/60" />
                    <div className="h-1.5 w-full rounded-full bg-primary/60" />
                    <div className="h-1.5 w-full rounded-full bg-primary/60" />
                    <div className="h-1.5 w-1/3 rounded-full bg-white/10" />
                </div>
            )}
            {!bar && !segments && <div className="mt-5 text-xs text-muted-foreground">{chip}</div>}
            {(bar || segments) && <div className="mt-3 text-xs text-muted-foreground">{chip}</div>}
        </div>
    );
}

function Logos() {
    const logos = ["Rivian Logistics", "Volta Energy", "EcoDrive", "MetroFleet", "Northwind EV", "Helios"];
    return (
        <section className="border-y border-border/60 bg-white/[0.02] py-10">
            <div className="mx-auto max-w-7xl px-6">
                <p className="text-center text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                    Trusted by leading commercial fleets
                </p>
                <div className="mt-6 grid grid-cols-2 items-center gap-x-8 gap-y-6 opacity-70 sm:grid-cols-3 lg:grid-cols-6">
                    {logos.map((l) => (
                        <div key={l} className="text-center font-display text-base font-semibold tracking-tight text-muted-foreground">
                            {l}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function Features() {
    return (
        <section id="features" className="px-6 py-28">
            <div className="mx-auto max-w-7xl">
                <SectionLabel eyebrow="Platform" title="Everything you need to run an electric fleet." subtitle="One operating system for monitoring, predicting, and optimizing your EV operations end-to-end." />

                <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-12">
                    {/* Big telemetry tile */}
                    <div className="glass group relative overflow-hidden rounded-3xl p-8 md:col-span-8">
                        <FeatureIcon icon={<Radio className="h-6 w-6" />} tone="primary" />
                        <h3 className="mt-6 font-display text-2xl font-bold">Real-time telemetry</h3>
                        <p className="mt-2 max-w-md text-sm text-muted-foreground">
                            Live GPS, speed, battery, temperature and diagnostics for every vehicle, streamed in milliseconds across the fleet.
                        </p>
                        <div className="mt-8 h-32 -mx-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={energyTrend.slice(0, 14)}>
                                    <defs>
                                        <linearGradient id="telem" x1="0" x2="0" y1="0" y2="1">
                                            <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.5} />
                                            <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <Area type="monotone" dataKey="kwh" stroke="var(--primary)" strokeWidth={2} fill="url(#telem)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
                    </div>

                    <FeatureCard
                        className="md:col-span-4"
                        icon={<BatteryCharging className="h-6 w-6" />}
                        tone="secondary"
                        title="Battery health AI"
                        body="Predict SoH degradation and remaining useful life with ML models trained on 1B+ miles."
                    />

                    <FeatureCard
                        className="md:col-span-4"
                        icon={<Cpu className="h-6 w-6" />}
                        tone="primary"
                        title="Predictive maintenance"
                        body="Catch failures before they ground vehicles. Cut maintenance costs by up to 32%."
                    />

                    {/* Driver scoring wide */}
                    <div className="glass relative overflow-hidden rounded-3xl p-8 md:col-span-8">
                        <div className="flex flex-col items-start gap-8 md:flex-row md:items-center">
                            <div className="flex-1">
                                <FeatureIcon icon={<ShieldCheck className="h-6 w-6" />} tone="secondary" />
                                <h3 className="mt-6 font-display text-2xl font-bold">AI driver scoring</h3>
                                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                                    Score safety, efficiency, and battery-friendly driving with explainable AI recommendations for coaching.
                                </p>
                            </div>
                            <div className="w-full rounded-2xl border border-border/70 bg-white/[0.03] p-6 md:w-64">
                                <div className="text-center">
                                    <div className="font-display text-5xl font-bold text-secondary">88</div>
                                    <div className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Avg safety score</div>
                                </div>
                                <div className="mt-5 space-y-2">
                                    <Bar w="92%" label="Smoothness" />
                                    <Bar w="78%" label="Efficiency" />
                                    <Bar w="65%" label="Speed comp." />
                                </div>
                            </div>
                        </div>
                    </div>

                    <FeatureCard
                        className="md:col-span-6"
                        icon={<RouteIcon className="h-6 w-6" />}
                        tone="primary"
                        title="AI route optimization"
                        body="Plan kWh-aware routes with charging stops and SLA-tight ETAs."
                    />
                    <FeatureCard
                        className="md:col-span-6"
                        icon={<MapPin className="h-6 w-6" />}
                        tone="secondary"
                        title="Geofencing & alerts"
                        body="Set zones, speed envelopes and critical thresholds. Get notified the moment they're breached."
                    />
                </div>
            </div>
        </section>
    );
}

function Bar({ w, label }: { w: string; label: string }) {
    return (
        <div>
            <div className="mb-1 flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
                <span>{label}</span><span>{w}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary" style={{ width: w }} />
            </div>
        </div>
    );
}

function FeatureIcon({ icon, tone }: { icon: React.ReactNode; tone: "primary" | "secondary" }) {
    const cls = tone === "primary" ? "bg-primary/15 text-primary" : "bg-secondary/15 text-secondary";
    return <div className={`grid h-12 w-12 place-items-center rounded-2xl ${cls}`}>{icon}</div>;
}

function FeatureCard({
    className = "", icon, tone, title, body,
}: { className?: string; icon: React.ReactNode; tone: "primary" | "secondary"; title: string; body: string }) {
    return (
        <div className={`glass rounded-3xl p-8 transition-all hover:-translate-y-0.5 hover:border-foreground/15 ${className}`}>
            <FeatureIcon icon={icon} tone={tone} />
            <h3 className="mt-6 font-display text-xl font-bold">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{body}</p>
        </div>
    );
}

function SectionLabel({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
    return (
        <div className="max-w-2xl">
            <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-primary">{eyebrow}</div>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">{title}</h2>
            {subtitle && <p className="mt-4 text-base text-muted-foreground">{subtitle}</p>}
        </div>
    );
}

function DashboardPreview() {
    return (
        <section id="dashboard" className="relative px-6 py-28">
            <div className="mx-auto max-w-7xl">
                <div className="grid items-center gap-14 md:grid-cols-2">
                    <div>
                        <SectionLabel eyebrow="Live dashboard" title="A control room for your entire fleet." />
                        <p className="mt-5 text-base text-muted-foreground">
                            Every vehicle, every kWh, every alert streamed into a single command center.
                            Built for fleet managers who can't afford blind spots.
                        </p>
                        <ul className="mt-7 space-y-3.5">
                            {[
                                "Glass cockpit KPIs and animated telemetry",
                                "Live map with status, geofences and routes",
                                "Battery, voltage, current and temperature charts",
                                "Critical alerts and intelligent recommendations",
                            ].map((t) => (
                                <li key={t} className="flex items-start gap-3 text-sm text-foreground/90">
                                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                                    {t}
                                </li>
                            ))}
                        </ul>
                        <Link to="/app/dashboard" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-primary group">
                            Explore the dashboard
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>

                    <div className="relative">
                        <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-tr from-primary/15 to-secondary/15 blur-2xl" />
                        <div className="glass-strong relative overflow-hidden rounded-3xl p-5">
                            <div className="flex items-center justify-between rounded-2xl bg-white/[0.03] px-4 py-3 text-xs text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-destructive/80" />
                                    <span className="h-2 w-2 rounded-full bg-warning/80" />
                                    <span className="h-2 w-2 rounded-full bg-primary/80" />
                                </div>
                                <div className="font-mono">voltfleet.app/dashboard</div>
                                <div className="font-mono">live</div>
                            </div>
                            <div className="mt-4 grid grid-cols-3 gap-3">
                                <MiniStat label="Active" value="147" tone="text-primary" />
                                <MiniStat label="Avg SOH" value="93%" tone="text-secondary" />
                                <MiniStat label="Alerts" value="3" tone="text-warning" />
                            </div>
                            <div className="mt-4 rounded-2xl border border-border/70 bg-white/[0.03] p-4">
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span className="font-semibold">Energy throughput</span>
                                    <span>Last 24h</span>
                                </div>
                                <div className="mt-3 h-44">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={energyTrend}>
                                            <defs>
                                                <linearGradient id="dashG" x1="0" x2="0" y1="0" y2="1">
                                                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.55} />
                                                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid stroke="oklch(1 0 0 / 0.04)" vertical={false} />
                                            <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={28} />
                                            <RTooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                                            <Area type="monotone" dataKey="kwh" stroke="var(--primary)" strokeWidth={2} fill="url(#dashG)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function MiniStat({ label, value, tone }: { label: string; value: string; tone: string }) {
    return (
        <div className="rounded-2xl border border-border/70 bg-white/[0.03] px-4 py-3">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</div>
            <div className={`mt-1 font-display text-2xl font-bold ${tone}`}>{value}</div>
        </div>
    );
}

function BatteryShowcase() {
    return (
        <section className="px-6 py-28">
            <div className="mx-auto max-w-7xl">
                <div className="grid items-center gap-14 md:grid-cols-2">
                    <div className="relative order-2 md:order-1">
                        <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-tr from-secondary/15 to-primary/10 blur-3xl" />
                        <div className="glass-strong relative rounded-3xl p-8">
                            <div className="flex items-end justify-between">
                                <div>
                                    <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Avg battery SOH</div>
                                    <div className="mt-1 font-display text-6xl font-bold text-primary">93%</div>
                                </div>
                                <div className="space-y-3 text-right">
                                    <Kv k="Voltage" v="382.4 V" />
                                    <Kv k="Temperature" v="29°C" />
                                    <Kv k="Cycles" v="412" />
                                    <Kv k="Remaining" v="7.2 yr" />
                                </div>
                            </div>
                            <div className="mt-8 h-44">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={batterySocSeries}>
                                        <defs>
                                            <linearGradient id="batG" x1="0" x2="0" y1="0" y2="1">
                                                <stop offset="0%" stopColor="var(--secondary)" stopOpacity={0.5} />
                                                <stop offset="100%" stopColor="var(--secondary)" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid stroke="oklch(1 0 0 / 0.04)" vertical={false} />
                                        <XAxis dataKey="time" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                                        <YAxis hide />
                                        <Area type="monotone" dataKey="soc" stroke="var(--secondary)" strokeWidth={2} fill="url(#batG)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="order-1 md:order-2">
                        <SectionLabel eyebrow="Battery analytics" title="See the chemistry behind every kilometer." />
                        <p className="mt-5 text-base text-muted-foreground">
                            VoltFleet's battery intelligence models diverging cells, SoH degradation, and thermal stress —
                            before they become tow trucks.
                        </p>
                        <div className="mt-7 grid grid-cols-2 gap-3">
                            {[
                                { k: "Cycle-aware forecasts", v: "Pack & cell" },
                                { k: "Thermal anomaly", v: "ML detection" },
                                { k: "Charging profiles", v: "Auto-tuned" },
                                { k: "Warranty triggers", v: "Built-in" },
                            ].map((x) => (
                                <div key={x.k} className="rounded-2xl border border-border/70 bg-white/[0.03] p-4">
                                    <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{x.v}</div>
                                    <div className="mt-1 text-sm font-semibold">{x.k}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function Kv({ k, v }: { k: string; v: string }) {
    return (
        <div>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{k}</div>
            <div className="font-display text-base font-bold">{v}</div>
        </div>
    );
}

function FleetShowcase() {
    return (
        <section className="px-6 py-28">
            <div className="mx-auto max-w-7xl">
                <SectionLabel
                    eyebrow="Fleet monitoring"
                    title="Every vehicle. Every second. One screen."
                    subtitle="Live map, telemetry stream, geofences and intelligent alerts — see the entire fleet at a glance and zoom into any vehicle in one click."
                />

                <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-12">
                    <div className="glass relative overflow-hidden rounded-3xl p-6 md:col-span-8">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-2 font-semibold text-foreground">
                                <MapPin className="h-4 w-4 text-primary" /> Live fleet map
                            </div>
                            <span>152 vehicles • SF Bay</span>
                        </div>
                        <div className="relative mt-5 h-72 overflow-hidden rounded-2xl border border-border/70 bg-[radial-gradient(ellipse_at_center,oklch(0.2_0.04_265)_0%,oklch(0.11_0.035_265)_100%)]">
                            {/* grid */}
                            <svg className="absolute inset-0 h-full w-full opacity-25" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <pattern id="g" width="40" height="40" patternUnits="userSpaceOnUse">
                                        <path d="M40 0H0V40" fill="none" stroke="oklch(1 0 0 / 0.08)" />
                                    </pattern>
                                </defs>
                                <rect width="100%" height="100%" fill="url(#g)" />
                            </svg>
                            {/* routes */}
                            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 280" preserveAspectRatio="none">
                                <path d="M30,220 Q120,80 220,140 T390,60" stroke="var(--primary)" strokeWidth="2" fill="none" strokeDasharray="4 6" opacity="0.7" />
                                <path d="M50,40 Q160,160 260,90 T380,220" stroke="var(--secondary)" strokeWidth="2" fill="none" strokeDasharray="4 6" opacity="0.7" />
                            </svg>
                            {/* markers */}
                            {[
                                { x: "12%", y: "60%", tone: "bg-primary" },
                                { x: "32%", y: "30%", tone: "bg-secondary" },
                                { x: "48%", y: "55%", tone: "bg-primary" },
                                { x: "65%", y: "40%", tone: "bg-warning" },
                                { x: "78%", y: "70%", tone: "bg-primary" },
                                { x: "88%", y: "25%", tone: "bg-secondary" },
                            ].map((m, i) => (
                                <div key={i} className="absolute" style={{ left: m.x, top: m.y }}>
                                    <span className={`absolute -inset-2 animate-ping rounded-full ${m.tone} opacity-30`} />
                                    <span className={`relative block h-2.5 w-2.5 rounded-full ${m.tone} ring-2 ring-background`} />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass flex flex-col rounded-3xl p-6 md:col-span-4">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-2 font-semibold text-foreground">
                                <Activity className="h-4 w-4 text-secondary" /> Live alerts
                            </div>
                            <span>last 5 min</span>
                        </div>
                        <div className="mt-5 space-y-3">
                            {[
                                { t: "VF-003 low SoC", d: "18% — divert to Mission Bay DCFC", tone: "bg-warning" },
                                { t: "VF-019 thermal", d: "Pack 4 trending +6°C", tone: "bg-destructive" },
                                { t: "VF-007 idle", d: "Stopped 12m off-route", tone: "bg-primary" },
                                { t: "VF-012 charge done", d: "92% • bay #4 freed", tone: "bg-secondary" },
                            ].map((a, i) => (
                                <div key={i} className="flex items-start gap-3 rounded-2xl border border-border/70 bg-white/[0.03] p-3">
                                    <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${a.tone}`} />
                                    <div className="min-w-0">
                                        <div className="truncate text-sm font-semibold">{a.t}</div>
                                        <div className="truncate text-xs text-muted-foreground">{a.d}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function Pricing() {
    const tiers = [
        {
            name: "Starter", price: "$49", per: "/vehicle/mo",
            desc: "Everything to get a small fleet online.",
            features: ["Real-time telemetry", "Battery monitoring", "Basic alerts", "Up to 25 vehicles"],
            cta: "Start free trial", featured: false,
        },
        {
            name: "Professional", price: "$89", per: "/vehicle/mo",
            desc: "Predictive intelligence at scale.",
            features: ["Everything in Starter", "Predictive maintenance", "AI route optimization", "Driver scoring", "API access"],
            cta: "Start free trial", featured: true,
        },
        {
            name: "Enterprise", price: "Custom", per: "",
            desc: "Mission-critical operations & SSO.",
            features: ["Unlimited vehicles", "Dedicated success", "SSO & audit logs", "Custom ML models", "99.99% SLA"],
            cta: "Talk to sales", featured: false,
        },
    ];
    return (
        <section id="pricing" className="px-6 py-28">
            <div className="mx-auto max-w-7xl">
                <div className="text-center">
                    <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-primary">Pricing</div>
                    <h2 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">Simple, scale-with-you plans</h2>
                    <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">No setup fees. No per-event charges. Pay only for active vehicles.</p>
                </div>

                <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
                    {tiers.map((t) => (
                        <div
                            key={t.name}
                            className={`relative rounded-3xl p-8 ${t.featured ? "glass-strong border-primary/40 shadow-[var(--shadow-glow)]" : "glass"}`}
                        >
                            {t.featured && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary-foreground">
                                    Most popular
                                </div>
                            )}
                            <div className="text-sm font-bold uppercase tracking-widest text-muted-foreground">{t.name}</div>
                            <div className="mt-3 flex items-baseline gap-1">
                                <span className="font-display text-5xl font-bold">{t.price}</span>
                                <span className="text-sm text-muted-foreground">{t.per}</span>
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">{t.desc}</p>
                            <ul className="mt-7 space-y-3 text-sm">
                                {t.features.map((f) => (
                                    <li key={f} className="flex items-start gap-2.5">
                                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                        <span className="text-foreground/90">{f}</span>
                                    </li>
                                ))}
                            </ul>
                            <Link
                                to={t.featured ? "/register" : "/register"}
                                className={`mt-8 inline-flex w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-bold transition-all ${t.featured
                                        ? "bg-primary text-primary-foreground hover:brightness-110 shadow-[var(--shadow-glow)]"
                                        : "border border-border bg-white/5 text-foreground hover:bg-white/10"
                                    }`}
                            >
                                {t.cta}
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function Testimonials() {
    const items = [
        {
            q: "VoltFleet cut our unplanned downtime by 41% in the first quarter. The battery predictions are uncanny.",
            n: "Helena Mora", r: "VP Operations, MetroFleet",
        },
        {
            q: "We went from spreadsheets to a real-time control room. Drivers love the coaching scores, finance loves the savings.",
            n: "Daniel Park", r: "Fleet Manager, EcoDrive",
        },
        {
            q: "The route optimizer alone paid for the platform within a month. Now we're scaling to 400 vehicles.",
            n: "Aisha Khan", r: "Director, Volta Energy",
        },
    ];
    return (
        <section className="px-6 py-28">
            <div className="mx-auto max-w-7xl">
                <SectionLabel eyebrow="Loved by fleet teams" title="Operators measure us in uptime." />
                <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
                    {items.map((t) => (
                        <figure key={t.n} className="glass rounded-3xl p-7">
                            <Sparkles className="h-5 w-5 text-primary" />
                            <blockquote className="mt-5 text-[15px] leading-relaxed text-foreground/90">"{t.q}"</blockquote>
                            <figcaption className="mt-6 flex items-center gap-3">
                                <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary font-display text-sm font-bold text-background">
                                    {t.n.split(" ").map((p) => p[0]).join("")}
                                </div>
                                <div>
                                    <div className="text-sm font-semibold">{t.n}</div>
                                    <div className="text-xs text-muted-foreground">{t.r}</div>
                                </div>
                            </figcaption>
                        </figure>
                    ))}
                </div>
            </div>
        </section>
    );
}

function Contact() {
    return (
        <section id="contact" className="px-6 py-28">
            <div className="mx-auto max-w-5xl">
                <div className="glass-strong relative overflow-hidden rounded-[2rem] p-10 md:p-14">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
                    <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-secondary/15 blur-3xl" />
                    <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
                        <div>
                            <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-primary">Contact sales</div>
                            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">Let's electrify your operations.</h2>
                            <p className="mt-4 text-sm text-muted-foreground">Tell us about your fleet — we'll get back within one business day with a tailored demo and pilot plan.</p>
                            <div className="mt-7 space-y-3 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Dedicated solutions engineer</div>
                                <div className="flex items-center gap-2"><Gauge className="h-4 w-4 text-primary" /> 30-day pilot, no commitment</div>
                                <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> SOC 2 Type II, GDPR-ready</div>
                            </div>
                        </div>
                        <form
                            onSubmit={(e) => e.preventDefault()}
                            className="grid grid-cols-1 gap-3"
                        >
                            <div className="grid grid-cols-2 gap-3">
                                <Field label="Full name" placeholder="Jane Cooper" />
                                <Field label="Work email" placeholder="jane@fleet.co" type="email" />
                            </div>
                            <Field label="Company" placeholder="Acme Mobility" />
                            <Field label="Fleet size" placeholder="25 vehicles" />
                            <div>
                                <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Tell us about your operations</label>
                                <textarea
                                    className="mt-1.5 w-full resize-none rounded-xl border border-border bg-white/[0.04] px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                    rows={3}
                                    placeholder="Routes, vehicles, pain points…"
                                />
                            </div>
                            <button className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-bold text-primary-foreground shadow-[var(--shadow-glow)] hover:brightness-110">
                                Request a demo <ArrowRight className="h-4 w-4" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}

function Field({ label, placeholder, type = "text" }: { label: string; placeholder: string; type?: string }) {
    return (
        <div>
            <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</label>
            <input
                type={type}
                placeholder={placeholder}
                className="mt-1.5 w-full rounded-xl border border-border bg-white/[0.04] px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
        </div>
    );
}

function Footer() {
    return (
        <footer className="border-t border-border/60 px-6 py-12">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
                <div className="flex items-center gap-2.5">
                    <div className="grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-primary to-secondary">
                        <Zap className="h-4 w-4 text-background" strokeWidth={2.5} />
                    </div>
                    <span className="font-display text-sm font-bold">VoltFleet AI</span>
                    <span className="ml-2 text-xs text-muted-foreground">© 2026</span>
                </div>
                <nav className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-muted-foreground">
                    <a href="#" className="hover:text-foreground">Security</a>
                    <a href="#" className="hover:text-foreground">Privacy</a>
                    <a href="#" className="hover:text-foreground">Terms</a>
                    <a href="#" className="hover:text-foreground">Documentation</a>
                    <a href="#" className="hover:text-foreground">Status</a>
                </nav>
            </div>
        </footer>
    );
}

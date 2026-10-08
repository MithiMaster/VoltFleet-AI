import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
    LayoutDashboard, Radio, Truck, Users, BatteryCharging, Route as RouteIcon,
    Wrench, Bell, FileText, Settings, User, LogOut, Plug, Sparkles, Zap,
    Car, DollarSign, AlertTriangle, Gauge,
} from "lucide-react";
import {
    Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
    SidebarHeader, SidebarFooter, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth-context";

// Manager navigation
const managerPrimary = [
    { title: "Dashboard", url: "/app/dashboard", icon: LayoutDashboard },
    { title: "Fleet Monitor", url: "/app/fleet", icon: Radio },
    { title: "Vehicles", url: "/app/vehicles", icon: Truck },
    { title: "Drivers", url: "/app/drivers", icon: Users },
    { title: "Battery Analytics", url: "/app/battery", icon: BatteryCharging },
    { title: "AI Driver Scoring", url: "/app/ai-scoring", icon: Sparkles },
];
const managerOps = [
    { title: "Route Optimization", url: "/app/routes", icon: RouteIcon },
    { title: "Charging", url: "/app/charging", icon: Plug },
    { title: "Maintenance", url: "/app/maintenance", icon: Wrench },
    { title: "Alerts", url: "/app/alerts", icon: Bell },
    { title: "Reports", url: "/app/reports", icon: FileText },
];

// Driver navigation
const driverPrimary = [
    { title: "My Dashboard", url: "/app/driver-dashboard", icon: LayoutDashboard },
    { title: "My Vehicle", url: "/app/vehicles", icon: Car },
    { title: "Charging", url: "/app/charging", icon: Plug },
    { title: "Maintenance", url: "/app/maintenance", icon: Wrench },
    { title: "Alerts", url: "/app/alerts", icon: Bell },
    { title: "Reports", url: "/app/reports", icon: FileText },
];

const account = [
    { title: "Settings", url: "/app/settings", icon: Settings },
    { title: "Profile", url: "/app/profile", icon: User },
];

export function AppSidebar() {
    const { state } = useSidebar();
    const collapsed = state === "collapsed";
    const pathname = useRouterState({ select: (s) => s.location.pathname });
    const isActive = (p: string) => pathname === p || pathname.startsWith(p + "/");
    const { user, logout } = useAuth();
    const nav = useNavigate();

    const isDriver = user?.role === "driver";

    const groups = isDriver
        ? [
            { label: "My Workspace", items: driverPrimary },
            { label: "Account", items: account },
        ]
        : [
            { label: "Operations", items: managerPrimary },
            { label: "Optimize", items: managerOps },
            { label: "Account", items: account },
        ];

    const handleLogout = () => {
        logout();
        nav({ to: "/login" });
    };

    return (
        <Sidebar collapsible="icon" className="border-r border-sidebar-border">
            <SidebarHeader className="px-3 py-4">
                <Link to={isDriver ? "/app/driver-dashboard" : "/app/dashboard"} className="flex items-center gap-2.5">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-[var(--shadow-glow)]">
                        <Zap className="h-5 w-5 text-background" strokeWidth={2.5} />
                    </div>
                    {!collapsed && (
                        <div className="leading-tight">
                            <div className="font-display text-sm font-semibold tracking-tight">VoltFleet AI</div>
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{isDriver ? "Driver Portal" : "Fleet OS"}</div>
                        </div>
                    )}
                </Link>
            </SidebarHeader>

            <SidebarContent>
                {groups.map((group) => (
                    <SidebarGroup key={group.label}>
                        {!collapsed && <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/70">{group.label}</SidebarGroupLabel>}
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {group.items.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}
                                            className="data-[active=true]:bg-gradient-to-r data-[active=true]:from-primary/20 data-[active=true]:to-secondary/10 data-[active=true]:text-foreground data-[active=true]:border data-[active=true]:border-primary/30">
                                            <Link to={item.url} className="flex items-center gap-2.5">
                                                <item.icon className="h-[18px] w-[18px]" />
                                                {!collapsed && <span>{item.title}</span>}
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border p-2">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Logout">
                            <button onClick={handleLogout} className="flex w-full items-center gap-2.5 text-muted-foreground hover:text-foreground">
                                <LogOut className="h-[18px] w-[18px]" />
                                {!collapsed && <span>Logout</span>}
                            </button>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}

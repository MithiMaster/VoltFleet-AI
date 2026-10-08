import { createFileRoute, Outlet, Link, useNavigate } from "@tanstack/react-router";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Bell, Search, Settings as SettingsIcon, User as UserIcon, LogOut as LogOutIcon } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/app")({
    head: () => ({ meta: [{ title: "VoltFleet AI — Control Room" }] }),
    component: AppLayout,
});

function AppLayout() {
    const { user, logout, isLoading } = useAuth();
    const nav = useNavigate();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleLogout = () => {
        logout();
        nav({ to: "/login" });
    };

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!isLoading && !user) {
            nav({ to: "/login" });
        }
    }, [isLoading, user, nav]);

    if (isLoading || !user) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        );
    }

    const initials = `${user.first_name[0] || ""}${user.last_name[0] || ""}`.toUpperCase();
    const fullName = `${user.first_name} ${user.last_name}`;
    const roleLabel = user.role === "manager" ? "Fleet Manager" : "Driver";

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full bg-background">
                <AppSidebar />
                <div className="flex min-w-0 flex-1 flex-col">
                    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/50 bg-background/70 px-4 backdrop-blur-xl">
                        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
                        <div className="hidden flex-1 items-center md:flex">
                            <div className="relative w-full max-w-md">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <input placeholder="Search vehicles, drivers, alerts…" className="h-9 w-full rounded-lg border border-border bg-card/50 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none" />
                            </div>
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                            <Link to="/app/alerts" className="relative grid h-9 w-9 place-items-center rounded-lg border border-border bg-card/50 hover:bg-card">
                                <Bell className="h-4 w-4" />
                                <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">8</span>
                            </Link>
                            <Link to="/app/settings" className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-card/50 hover:bg-card">
                                <SettingsIcon className="h-4 w-4" />
                            </Link>
                            {mounted ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="flex items-center gap-2 rounded-lg border border-border bg-card/50 py-1 pl-1 pr-3 hover:bg-card focus:outline-none cursor-pointer">
                                            <div className={`grid h-7 w-7 place-items-center rounded-md text-xs font-semibold text-background ${user.role === "driver" ? "bg-gradient-to-br from-secondary to-emerald-400" : "bg-gradient-to-br from-primary to-secondary"}`}>
                                                {initials}
                                            </div>
                                            <div className="hidden text-left leading-tight sm:block">
                                                <div className="text-xs font-medium">{fullName}</div>
                                                <div className="text-[10px] text-muted-foreground">{roleLabel}</div>
                                            </div>
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56 glass border-border/50">
                                        <DropdownMenuLabel className="font-display">
                                            <div className="text-sm font-semibold">{fullName}</div>
                                            <div className="text-xs text-muted-foreground font-normal">{user.email}</div>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator className="bg-border/50" />
                                        <DropdownMenuItem asChild className="focus:bg-primary/10 focus:text-foreground cursor-pointer">
                                            <Link to="/app/profile" className="flex w-full items-center gap-2">
                                                <UserIcon className="h-4 w-4" />
                                                <span>My Profile</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild className="focus:bg-primary/10 focus:text-foreground cursor-pointer">
                                            <Link to="/app/settings" className="flex w-full items-center gap-2">
                                                <SettingsIcon className="h-4 w-4" />
                                                <span>Settings</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator className="bg-border/50" />
                                        <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer flex items-center gap-2">
                                            <LogOutIcon className="h-4 w-4" />
                                            <span>Logout</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <div className="flex items-center gap-2 rounded-lg border border-border bg-card/50 py-1 pl-1 pr-3">
                                    <div className={`grid h-7 w-7 place-items-center rounded-md text-xs font-semibold text-background ${user.role === "driver" ? "bg-gradient-to-br from-secondary to-emerald-400" : "bg-gradient-to-br from-primary to-secondary"}`}>
                                        {initials}
                                    </div>
                                    <div className="hidden text-left leading-tight sm:block">
                                        <div className="text-xs font-medium">{fullName}</div>
                                        <div className="text-[10px] text-muted-foreground">{roleLabel}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </header>
                    <main className="min-w-0 flex-1 p-4 sm:p-6">
                        <Outlet />
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}

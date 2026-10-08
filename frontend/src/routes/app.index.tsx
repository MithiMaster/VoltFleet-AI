import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { useEffect } from "react";

export const Route = createFileRoute("/app/")({
    component: AppIndex,
});

function AppIndex() {
    const { user } = useAuth();
    const nav = useNavigate();

    useEffect(() => {
        if (user?.role === "driver") {
            nav({ to: "/app/driver-dashboard" });
        } else {
            nav({ to: "/app/dashboard" });
        }
    }, [user, nav]);

    return null;
}

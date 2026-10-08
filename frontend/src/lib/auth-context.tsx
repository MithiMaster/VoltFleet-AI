import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export interface AuthUser {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    company: string;
    role: "manager" | "driver";
    is_verified: boolean;
    phone?: string;
    location?: string;
}

interface AuthContextType {
    user: AuthUser | null;
    token: string | null;
    login: (email: string, password: string) => Promise<AuthUser>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => void;
    updateProfile: (profileData: Partial<AuthUser>) => Promise<void>;
    isLoading: boolean;
}

interface RegisterData {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    company: string;
    role: "manager" | "driver";
}

const AuthContext = createContext<AuthContextType | null>(null);

const API_BASE = "http://localhost:8000";

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Restore session on mount
    useEffect(() => {
        const saved = localStorage.getItem("voltfleet_auth");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setUser(parsed.user);
                setToken(parsed.token);
            } catch {
                localStorage.removeItem("voltfleet_auth");
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        const res = await fetch(`${API_BASE}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || "Login failed");
        }
        const data = await res.json();
        setUser(data.user);
        setToken(data.access_token);
        localStorage.setItem("voltfleet_auth", JSON.stringify({ user: data.user, token: data.access_token }));
        return data.user as AuthUser;
    };

    const register = async (regData: RegisterData) => {
        const res = await fetch(`${API_BASE}/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(regData),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || "Registration failed");
        }
        const data = await res.json();
        setUser(data.user);
        setToken(data.access_token);
        localStorage.setItem("voltfleet_auth", JSON.stringify({ user: data.user, token: data.access_token }));
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("voltfleet_auth");
    };

    const updateProfile = async (profileData: Partial<AuthUser>) => {
        const res = await fetch(`${API_BASE}/api/auth/profile`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(profileData),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || "Failed to update profile");
        }
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem("voltfleet_auth", JSON.stringify({ user: data.user, token }));
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, updateProfile, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}

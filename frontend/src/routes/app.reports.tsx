import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Download, FileText, Loader2, FolderCheck, HardDrive, RefreshCw, FileSpreadsheet, FileCode } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { useState, useEffect, useCallback } from "react";

export const Route = createFileRoute("/app/reports")({
    head: () => ({ meta: [{ title: "Reports — VoltFleet AI" }] }),
    component: Reports,
});

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Map display name → backend slug
const SLUG_MAP: Record<string, string> = {
    "Fleet performance": "fleet-performance",
    "Driver performance": "driver-performance",
    "Battery health": "battery-health",
    "Maintenance": "maintenance",
    "Energy consumption": "energy-consumption",
    "Revenue analytics": "revenue-analytics",
};

const FORMAT_MAP: Record<string, string> = {
    "PDF": "pdf",
    "Excel": "excel",
    "CSV": "csv",
};

const reports = [
    { name: "Fleet performance", desc: "Uptime, utilization and trips by vehicle.", color: "from-primary/30 to-secondary/10" },
    { name: "Driver performance", desc: "Safety, efficiency and revenue per driver.", color: "from-secondary/30 to-primary/10" },
    { name: "Battery health", desc: "SoH, voltage divergence and cycle counts.", color: "from-fuchsia-500/30 to-primary/10" },
    { name: "Maintenance", desc: "Service history, costs and downtime causes.", color: "from-amber-400/30 to-secondary/10" },
    { name: "Energy consumption", desc: "kWh usage, cost and off-peak savings.", color: "from-primary/30 to-amber-400/10" },
    { name: "Revenue analytics", desc: "Revenue, margin and trip profitability.", color: "from-secondary/30 to-fuchsia-500/10" },
];

interface SavedReport {
    filename: string;
    format: string;
    size_bytes: number;
    size_kb: number;
    created_at: string;
}

function Reports() {
    const { token } = useAuth();
    const [loading, setLoading] = useState<string | null>(null); // "reportSlug-format"
    const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
    const [loadingSaved, setLoadingSaved] = useState(false);

    const fetchSavedReports = useCallback(async () => {
        if (!token) return;
        setLoadingSaved(true);
        try {
            const res = await fetch(`${API_BASE}/api/reports/saved`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setSavedReports(data);
            }
        } catch {
            // Ignore error on background fetch
        } finally {
            setLoadingSaved(false);
        }
    }, [token]);

    useEffect(() => {
        fetchSavedReports();
    }, [fetchSavedReports]);

    const downloadReport = async (reportName: string, format: string) => {
        const slug = SLUG_MAP[reportName];
        const fmt = FORMAT_MAP[format];
        if (!slug || !fmt) return;

        const key = `${slug}-${fmt}`;
        setLoading(key);

        try {
            const ext = fmt === "excel" ? "xlsx" : fmt.toLowerCase();

            // Direct native browser download URL with token
            // This forces Microsoft Edge and Chrome to download directly via HTTP headers
            // and completely avoids the nameless blob UUID bug in Chromium!
            const downloadUrl = `${API_BASE}/api/reports/download/${slug}/${fmt}?token=${encodeURIComponent(token || "")}`;
            
            const a = document.createElement("a");
            a.style.display = "none";
            a.href = downloadUrl;
            a.setAttribute("download", `${slug}.${ext}`);
            document.body.appendChild(a);
            a.click();
            
            setTimeout(() => {
                if (document.body.contains(a)) document.body.removeChild(a);
            }, 3000);

            toast.success(`Downloaded "${reportName}" as ${format} and saved to Reports/ folder!`);
            setTimeout(fetchSavedReports, 1200);
        } catch (err: any) {
            toast.error(err.message || "Failed to download report");
        } finally {
            setLoading(null);
        }
    };

    const downloadSavedFile = (filename: string) => {
        const downloadUrl = `${API_BASE}/api/reports/saved/${encodeURIComponent(filename)}?token=${encodeURIComponent(token || "")}`;
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = downloadUrl;
        a.setAttribute("download", filename);
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            if (document.body.contains(a)) document.body.removeChild(a);
        }, 3000);
        toast.success(`Downloading ${filename}`);
    };

    const getFormatBadge = (fmt: string) => {
        switch (fmt) {
            case "pdf":
                return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">PDF</span>;
            case "xlsx":
                return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">EXCEL</span>;
            case "csv":
                return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">CSV</span>;
            default:
                return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-muted text-muted-foreground">{fmt.toUpperCase()}</span>;
        }
    };

    const getFormatIcon = (fmt: string) => {
        switch (fmt) {
            case "pdf":
                return <FileText className="h-4 w-4 text-rose-400" />;
            case "xlsx":
                return <FileSpreadsheet className="h-4 w-4 text-emerald-400" />;
            case "csv":
                return <FileCode className="h-4 w-4 text-sky-400" />;
            default:
                return <FileText className="h-4 w-4 text-muted-foreground" />;
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader 
                title="Reports" 
                subtitle="Export and archive executive-ready performance reports in PDF, Excel, and CSV format." 
            />

            {/* Notification Banner on Auto-Save into Reports Folder */}
            <div className="flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/10 p-4 text-xs text-foreground">
                <FolderCheck className="h-5 w-5 text-primary shrink-0" />
                <div>
                    <span className="font-semibold text-primary block">Automatic Multi-Channel Export</span>
                    <span className="text-muted-foreground">
                        Clicking any format triggers an instant browser download and automatically saves a permanent archival copy into your local 
                        <code className="mx-1 px-1.5 py-0.5 rounded bg-card border border-border text-foreground font-mono">Reports/</code> folder.
                    </span>
                </div>
            </div>

            {/* Report Generator Cards Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {reports.map((r) => (
                    <div key={r.name} className="glass rounded-2xl p-5 flex flex-col justify-between">
                        <div>
                            <div className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${r.color}`}>
                                <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <h3 className="mt-4 font-display text-lg font-semibold">{r.name}</h3>
                            <p className="mt-1 text-sm text-muted-foreground">{r.desc}</p>
                        </div>
                        <div className="mt-4 flex gap-2">
                            {["PDF", "Excel", "CSV"].map((f) => {
                                const key = `${SLUG_MAP[r.name]}-${FORMAT_MAP[f]}`;
                                const isLoading = loading === key;
                                return (
                                    <button
                                        key={f}
                                        disabled={isLoading}
                                        onClick={() => downloadReport(r.name, f)}
                                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-card/50 px-3 py-1.5 text-xs hover:bg-card hover:border-primary/50 disabled:opacity-50 transition-all duration-200 cursor-pointer"
                                    >
                                        {isLoading
                                            ? <Loader2 className="h-3 w-3 animate-spin text-primary" />
                                            : <Download className="h-3 w-3" />
                                        }
                                        {f}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Saved in Reports Folder Archive Section */}
            <div className="glass rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <div className="flex items-center gap-2">
                        <HardDrive className="h-5 w-5 text-primary" />
                        <div>
                            <h3 className="font-display text-base font-semibold text-foreground">
                                Saved in Reports Folder (<code className="font-mono text-xs text-primary">Reports/</code>)
                            </h3>
                            <span className="text-xs text-muted-foreground">
                                {savedReports.length} {savedReports.length === 1 ? 'file' : 'files'} stored in project directory
                            </span>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={fetchSavedReports}
                        disabled={loadingSaved}
                        className="flex items-center gap-1.5 rounded-xl border border-border bg-card/60 px-3 py-1.5 text-xs text-foreground hover:bg-card transition cursor-pointer"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${loadingSaved ? 'animate-spin' : ''}`} /> Refresh Archive
                    </button>
                </div>

                {savedReports.length === 0 ? (
                    <div className="py-8 text-center space-y-2">
                        <FolderCheck className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                        <div className="text-sm font-semibold text-muted-foreground">No reports generated yet</div>
                        <div className="text-xs text-muted-foreground/80 max-w-sm mx-auto">
                            Click any PDF, Excel, or CSV button above to generate a report and save it to the Reports folder.
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 max-h-72 overflow-y-auto pr-1">
                        {savedReports.map((file) => (
                            <div 
                                key={file.filename}
                                className="flex items-center justify-between p-3 rounded-xl border border-border/70 bg-card/40 hover:bg-card/70 transition"
                            >
                                <div className="flex items-center gap-2.5 truncate mr-2">
                                    <div className="p-1.5 rounded-lg bg-card border border-border shrink-0">
                                        {getFormatIcon(file.format)}
                                    </div>
                                    <div className="truncate">
                                        <div className="text-xs font-semibold text-foreground truncate" title={file.filename}>
                                            {file.filename}
                                        </div>
                                        <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                            {getFormatBadge(file.format)}
                                            <span>•</span>
                                            <span>{file.size_kb} KB</span>
                                            <span>•</span>
                                            <span>{file.created_at.split(' ')[0]}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => downloadSavedFile(file.filename)}
                                    title="Download file"
                                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-card border border-border shrink-0 cursor-pointer transition"
                                >
                                    <Download className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

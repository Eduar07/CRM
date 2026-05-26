import { useState, useCallback, useEffect, useRef } from "react";
import {
  Search,
  Globe,
  FileText,
  History,
  Zap,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  RefreshCw,
  Building2,
  Phone,
  Mail,
  MapPin,
  Link2,
  Users,
  Briefcase,
  Star,
  AlertCircle,
  Copy,
  ChevronDown,
  Sparkles,
  Activity,
  Hash,
} from "lucide-react";
import {
  scrapeCompany,
  extractWithAI,
  extractFromHTML,
  saveScrapedCompany,
} from "../services/scraping.service";
import type {
  ScrapedCompany,
  ScrapingHistoryItem,
  ScrapingStats,
  ScrapingMethod,
} from "../types/scraping";

// ─── Constants ────────────────────────────────────────────────────────────────
const HISTORY_KEY = "crm-scraping-history";
const STATS_KEY = "crm-scraping-stats";

const LOADING_STEPS = [
  "Iniciando navegador headless...",
  "Conectando con el sitio web...",
  "Cargando contenido dinámico...",
  "Extrayendo datos de la empresa...",
  "Normalizando información...",
  "Calculando score de calidad...",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function detectInputType(input: string): "url" | "name" | "nit" {
  const trimmed = input.trim();
  if (/^https?:\/\//i.test(trimmed)) return "url";
  if (/^\d{9,10}[-]?\d?$/.test(trimmed.replace(/\s/g, ""))) return "nit";
  return "name";
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function formatDuration(ms?: number): string {
  if (!ms) return "—";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("es-CO", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function loadHistory(): ScrapingHistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function loadStats(): ScrapingStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    return raw ? JSON.parse(raw) : { total: 0, successful: 0, failed: 0 };
  } catch {
    return { total: 0, successful: 0, failed: 0 };
  }
}

function saveHistory(items: ScrapingHistoryItem[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, 100)));
}

function saveStats(stats: ScrapingStats) {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

function exportCSV(items: ScrapingHistoryItem[]) {
  const headers = [
    "Fecha",
    "Input",
    "Estado",
    "Empresa",
    "NIT",
    "Ciudad",
    "Industria",
    "Teléfonos",
    "Emails",
    "Website",
    "Score",
    "Método",
    "Duración",
  ];
  const rows = items.map((item) => [
    formatDate(item.timestamp),
    `"${item.input}"`,
    item.status,
    `"${item.company?.razonSocial ?? ""}"`,
    item.company?.nit ?? "",
    item.company?.ciudad ?? "",
    item.company?.industria ?? "",
    `"${(item.company?.telefonos ?? []).join("; ")}"`,
    `"${(item.company?.emails ?? []).join("; ")}"`,
    item.company?.website ?? "",
    item.company?.qualityScore ?? "",
    item.method ?? "",
    formatDuration(item.duration),
  ]);
  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `scraping-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const r = 20;
  const circ = 2 * Math.PI * r;
  const progress = circ - (score / 100) * circ;
  const color =
    score >= 75
      ? "#22c55e"
      : score >= 50
      ? "#f59e0b"
      : "#ef4444";

  return (
    <div className="relative flex items-center justify-center w-14 h-14">
      <svg className="-rotate-90" width="56" height="56">
        <circle
          cx="28"
          cy="28"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className="text-gray-200 dark:text-gray-700"
        />
        <circle
          cx="28"
          cy="28"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeDasharray={circ}
          strokeDashoffset={progress}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <span
        className="absolute text-[11px] font-bold"
        style={{ color }}
      >
        {score}
      </span>
    </div>
  );
}

function MethodBadge({ method }: { method?: ScrapingMethod }) {
  const cfg: Record<string, { label: string; cls: string }> = {
    puppeteer: {
      label: "Puppeteer",
      cls: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    },
    fetch: {
      label: "Fetch",
      cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    },
    cheerio: {
      label: "Cheerio",
      cls: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
    },
    ai: {
      label: "IA",
      cls: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
    },
    manual: {
      label: "Manual",
      cls: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    },
  };
  if (!method) return null;
  const { label, cls } = cfg[method] ?? cfg.manual;
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${cls}`}>
      {label}
    </span>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
            {label}
          </p>
          <p className={`mt-2 text-3xl font-bold ${color}`}>{value}</p>
          {sub && (
            <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">
              {sub}
            </p>
          )}
        </div>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${color
            .replace("text-", "bg-")
            .replace("-600", "-100")
            .replace("-400", "-900/30")} `}
        >
          <Icon size={18} className={color} />
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton({ step }: { step: string }) {
  return (
    <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-6 dark:border-indigo-800/50 dark:bg-indigo-950/30">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/40">
          <Activity size={18} className="animate-pulse text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Scraping en progreso
          </p>
          <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-0.5">
            {step}
          </p>
        </div>
        <div className="ml-auto flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-2 w-2 rounded-full bg-indigo-500"
              style={{
                animation: `bounce 1.2s ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {[80, 60, 70, 50].map((w, i) => (
          <div
            key={i}
            className="h-3 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800"
            style={{ width: `${w}%` }}
          />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-12 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800"
          />
        ))}
      </div>
    </div>
  );
}

function DataTag({ value, color = "gray" }: { value: string; color?: string }) {
  const cls: Record<string, string> = {
    gray: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    green:
      "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    purple:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    amber:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  };
  return (
    <span
      className={`inline-block rounded-lg px-2 py-1 text-[11px] font-medium ${
        cls[color] ?? cls.gray
      }`}
    >
      {value}
    </span>
  );
}

function PreviewCard({
  data,
  onSave,
  onCancel,
  saving,
}: {
  data: ScrapedCompany;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [showJSON, setShowJSON] = useState(false);

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const allPhones = [...(data.telefonos ?? []), ...(data.celulares ?? [])];
  const hasSocial = Object.values(data.redesSociales ?? {}).some(Boolean);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden dark:border-gray-700 dark:bg-gray-900">
      {/* Header strip */}
      <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

      <div className="p-6">
        {/* Company header */}
        <div className="flex items-start gap-4 mb-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-xl font-bold text-white shadow-lg">
            {(data.razonSocial || data.nombreComercial || "?")[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight">
              {data.razonSocial || data.nombreComercial || "Sin nombre"}
            </h3>
            {data.nit && (
              <p className="mt-0.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 tracking-wide">
                NIT: {data.nit}
              </p>
            )}
            {data.nombreComercial && data.razonSocial !== data.nombreComercial && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {data.nombreComercial}
              </p>
            )}
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {data.estadoEmpresa && (
                <DataTag
                  value={data.estadoEmpresa}
                  color={
                    data.estadoEmpresa.toLowerCase().includes("activ")
                      ? "green"
                      : "gray"
                  }
                />
              )}
              {data.industria && (
                <DataTag value={data.industria} color="purple" />
              )}
            </div>
          </div>
          <ScoreRing score={data.qualityScore ?? 0} />
        </div>

        {/* Data grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Location */}
          {(data.ciudad || data.departamento || data.direccion) && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <MapPin size={14} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                  Ubicación
                </p>
                <p className="text-sm text-gray-800 dark:text-gray-200 leading-snug">
                  {[data.ciudad, data.departamento].filter(Boolean).join(", ")}
                </p>
                {data.direccion && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {data.direccion}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Phones */}
          {allPhones.length > 0 && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/20">
                <Phone size={14} className="text-green-600 dark:text-green-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                  Teléfonos
                </p>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {allPhones.slice(0, 3).map((p, i) => (
                    <DataTag key={i} value={p} color="green" />
                  ))}
                  {allPhones.length > 3 && (
                    <DataTag value={`+${allPhones.length - 3} más`} />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Emails */}
          {(data.emails ?? []).length > 0 && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-900/20">
                <Mail size={14} className="text-amber-600 dark:text-amber-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                  Emails
                </p>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {(data.emails ?? []).slice(0, 2).map((e, i) => (
                    <DataTag key={i} value={e} color="amber" />
                  ))}
                  {(data.emails ?? []).length > 2 && (
                    <DataTag value={`+${data.emails.length - 2} más`} />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Website */}
          {data.website && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-900/20">
                <Globe size={14} className="text-purple-600 dark:text-purple-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                  Sitio web
                </p>
                <a
                  href={data.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-indigo-600 hover:underline dark:text-indigo-400 truncate block"
                >
                  {data.website}
                </a>
              </div>
            </div>
          )}

          {/* Employees */}
          {data.empleados && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-pink-50 dark:bg-pink-900/20">
                <Users size={14} className="text-pink-600 dark:text-pink-400" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                  Empleados
                </p>
                <p className="text-sm text-gray-800 dark:text-gray-200">
                  {data.empleados}
                </p>
              </div>
            </div>
          )}

          {/* Rep legal */}
          {data.representanteLegal && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
                <Briefcase size={14} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                  Representante legal
                </p>
                <p className="text-sm text-gray-800 dark:text-gray-200">
                  {data.representanteLegal}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Social networks */}
        {hasSocial && (
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <Link2 size={13} className="text-gray-400" />
            {data.redesSociales?.linkedin && (
              <a
                href={data.redesSociales.linkedin}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-indigo-600 hover:underline dark:text-indigo-400"
              >
                LinkedIn
              </a>
            )}
            {data.redesSociales?.facebook && (
              <a
                href={data.redesSociales.facebook}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-600 hover:underline dark:text-blue-400"
              >
                Facebook
              </a>
            )}
            {data.redesSociales?.instagram && (
              <a
                href={data.redesSociales.instagram}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-pink-600 hover:underline dark:text-pink-400"
              >
                Instagram
              </a>
            )}
          </div>
        )}

        {/* Description */}
        {data.descripcion && (
          <div className="mt-4 rounded-xl bg-gray-50 p-3 dark:bg-gray-800">
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              {data.descripcion}
            </p>
          </div>
        )}

        {/* Keywords */}
        {(data.keywords ?? []).length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {data.keywords.slice(0, 8).map((k, i) => (
              <DataTag key={i} value={k} />
            ))}
          </div>
        )}

        {/* Toggle JSON */}
        <button
          onClick={() => setShowJSON(!showJSON)}
          className="mt-4 flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <ChevronDown
            size={13}
            className={`transition-transform ${showJSON ? "rotate-180" : ""}`}
          />
          {showJSON ? "Ocultar" : "Ver"} JSON estructurado
        </button>
        {showJSON && (
          <div className="mt-2 relative">
            <pre className="rounded-xl bg-gray-950 p-4 text-[11px] text-green-400 overflow-auto max-h-48 font-mono">
              {JSON.stringify(data, null, 2)}
            </pre>
            <button
              onClick={handleCopyJSON}
              className="absolute top-2 right-2 rounded-lg bg-gray-800 px-2 py-1 text-[10px] text-gray-300 hover:bg-gray-700 transition-colors"
            >
              {copied ? "Copiado ✓" : <Copy size={11} />}
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="mt-5 flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 transition-all shadow-sm hover:shadow-md"
          >
            {saving ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <CheckCircle2 size={14} />
                Guardar empresa
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function ScrapingPage() {
  const [activeTab, setActiveTab] = useState<"auto" | "manual" | "history">(
    "auto"
  );
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [scrapedData, setScrapedData] = useState<ScrapedCompany | null>(null);
  const [scrapeError, setScrapeError] = useState("");
  const [saving, setSaving] = useState(false);

  const [manualContent, setManualContent] = useState("");
  const [manualLoading, setManualLoading] = useState(false);
  const [manualError, setManualError] = useState("");

  const [history, setHistory] = useState<ScrapingHistoryItem[]>(loadHistory);
  const [stats, setStats] = useState<ScrapingStats>(loadStats);
  const [historyFilter, setHistoryFilter] = useState("");
  const [historyStatus, setHistoryStatus] = useState("");

  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const stepTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTime = useRef<number>(0);

  useEffect(() => {
    saveHistory(history);
    saveStats(stats);
  }, [history, stats]);

  const showToast = useCallback(
    (msg: string, type: "success" | "error" | "info" = "success") => {
      setToast({ msg, type });
      setTimeout(() => setToast(null), 4000);
    },
    []
  );

  const startLoadingSteps = useCallback(() => {
    let idx = 0;
    setLoadingStep(LOADING_STEPS[0]);
    stepTimer.current = setInterval(() => {
      idx = (idx + 1) % LOADING_STEPS.length;
      setLoadingStep(LOADING_STEPS[idx]);
    }, 2500);
  }, []);

  const stopLoadingSteps = useCallback(() => {
    if (stepTimer.current) {
      clearInterval(stepTimer.current);
      stepTimer.current = null;
    }
  }, []);

  const addToHistory = useCallback(
    (
      input: string,
      status: "success" | "error",
      company?: ScrapedCompany,
      error?: string,
      method?: ScrapingMethod,
      duration?: number
    ) => {
      const item: ScrapingHistoryItem = {
        id: generateId(),
        input,
        status,
        company,
        error,
        timestamp: new Date().toISOString(),
        duration,
        method,
        saved: false,
      };
      setHistory((prev) => [item, ...prev]);
      setStats((prev) => {
        const next = {
          total: prev.total + 1,
          successful: prev.successful + (status === "success" ? 1 : 0),
          failed: prev.failed + (status === "error" ? 1 : 0),
          lastRun: new Date().toISOString(),
        };
        return next;
      });
    },
    []
  );

  const handleScrape = useCallback(async () => {
    if (!inputValue.trim()) return;
    setScrapedData(null);
    setScrapeError("");
    setIsLoading(true);
    startLoadingSteps();
    startTime.current = Date.now();

    const type = detectInputType(inputValue);

    try {
      const result = await scrapeCompany({ input: inputValue.trim(), type });
      const duration = Date.now() - startTime.current;

      if (result.success && result.data) {
        setScrapedData(result.data);
        addToHistory(
          inputValue,
          "success",
          result.data,
          undefined,
          result.method,
          duration
        );
        showToast("Datos extraídos correctamente", "success");
      } else {
        const err = result.error ?? "No se pudo extraer información";
        setScrapeError(err);
        addToHistory(inputValue, "error", undefined, err, result.method, duration);
        showToast(err, "error");
      }
    } catch (e) {
      const duration = Date.now() - startTime.current;
      const msg =
        e instanceof Error
          ? e.message
          : "Error de conexión con el servicio de scraping";
      setScrapeError(msg);
      addToHistory(inputValue, "error", undefined, msg, undefined, duration);
      showToast(msg, "error");
    } finally {
      stopLoadingSteps();
      setIsLoading(false);
    }
  }, [inputValue, addToHistory, showToast, startLoadingSteps, stopLoadingSteps]);

  const handleManualExtract = useCallback(
    async (useAI: boolean) => {
      if (!manualContent.trim()) return;
      setManualLoading(true);
      setManualError("");
      setScrapedData(null);
      startTime.current = Date.now();

      try {
        const result = useAI
          ? await extractWithAI(manualContent)
          : await extractFromHTML(manualContent);
        const duration = Date.now() - startTime.current;

        if (result.success && result.data) {
          setScrapedData(result.data);
          addToHistory(
            "(manual)",
            "success",
            result.data,
            undefined,
            result.method,
            duration
          );
          setActiveTab("auto");
          showToast("Datos extraídos. Revisa la vista previa.", "info");
        } else {
          const err = result.error ?? "No se pudo extraer información";
          setManualError(err);
          addToHistory("(manual)", "error", undefined, err, result.method, duration);
        }
      } catch (e) {
        const duration = Date.now() - startTime.current;
        const msg = e instanceof Error ? e.message : "Error al extraer";
        setManualError(msg);
        addToHistory("(manual)", "error", undefined, msg, undefined, duration);
      } finally {
        setManualLoading(false);
      }
    },
    [manualContent, addToHistory, showToast]
  );

  const handleSave = useCallback(async () => {
    if (!scrapedData) return;
    setSaving(true);
    try {
      await saveScrapedCompany(scrapedData);
      setHistory((prev) =>
        prev.map((item, i) =>
          i === 0 ? { ...item, saved: true } : item
        )
      );
      setScrapedData(null);
      setInputValue("");
      showToast("Empresa guardada en el CRM ✓", "success");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al guardar";
      showToast(msg, "error");
    } finally {
      setSaving(false);
    }
  }, [scrapedData, showToast]);

  const filteredHistory = history.filter((item) => {
    const q = historyFilter.toLowerCase();
    const matchQ =
      !q ||
      item.input.toLowerCase().includes(q) ||
      (item.company?.razonSocial ?? "").toLowerCase().includes(q);
    const matchStatus = !historyStatus || item.status === historyStatus;
    return matchQ && matchStatus;
  });

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-950">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium shadow-xl border animate-in slide-in-from-top-2 ${
            toast.type === "success"
              ? "bg-green-500 text-white border-green-600"
              : toast.type === "error"
              ? "bg-red-500 text-white border-red-600"
              : "bg-indigo-600 text-white border-indigo-700"
          }`}
        >
          {toast.type === "success" && <CheckCircle2 size={15} />}
          {toast.type === "error" && <XCircle size={15} />}
          {toast.type === "info" && <AlertCircle size={15} />}
          {toast.msg}
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
            <Sparkles size={17} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Scraping
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Extracción automática de datos empresariales B2B
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* ── Stats ── */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            icon={Hash}
            label="Total scrapeados"
            value={stats.total}
            color="text-indigo-600 dark:text-indigo-400"
          />
          <StatCard
            icon={CheckCircle2}
            label="Exitosos"
            value={stats.successful}
            color="text-green-600 dark:text-green-400"
          />
          <StatCard
            icon={XCircle}
            label="Fallidos"
            value={stats.failed}
            color="text-red-500 dark:text-red-400"
          />
          <StatCard
            icon={Clock}
            label="Última ejecución"
            value={stats.lastRun ? formatDate(stats.lastRun) : "—"}
            color="text-amber-600 dark:text-amber-400"
          />
        </div>

        {/* ── Tabs ── */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          {/* Tab bar */}
          <div className="flex border-b border-gray-100 dark:border-gray-800 px-2 pt-2">
            {(
              [
                { key: "auto", label: "Búsqueda automática", icon: Zap },
                { key: "manual", label: "Modo manual", icon: FileText },
                { key: "history", label: "Historial", icon: History },
              ] as const
            ).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={[
                  "flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-xl border-b-2 transition-all",
                  activeTab === key
                    ? "border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300",
                ].join(" ")}
              >
                <Icon size={14} />
                {label}
                {key === "history" && history.length > 0 && (
                  <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-gray-200 px-1 text-[10px] font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                    {history.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── Tab: Auto ── */}
          {activeTab === "auto" && (
            <div className="p-6 space-y-5">
              {/* Input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">
                  URL, Nombre de empresa o NIT
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                      {inputValue && detectInputType(inputValue) === "url" ? (
                        <Globe size={15} className="text-indigo-500" />
                      ) : inputValue &&
                        detectInputType(inputValue) === "nit" ? (
                        <Hash size={15} className="text-amber-500" />
                      ) : (
                        <Search size={15} className="text-gray-400" />
                      )}
                    </div>
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => {
                        setInputValue(e.target.value);
                        setScrapedData(null);
                        setScrapeError("");
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handleScrape()}
                      placeholder="https://informacolombia.com/... · Empresa XYZ · 900123456-1"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-indigo-900 dark:focus:bg-gray-800"
                    />
                    {inputValue && (
                      <div className="absolute inset-y-0 right-3 flex items-center">
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                            detectInputType(inputValue) === "url"
                              ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
                              : detectInputType(inputValue) === "nit"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                              : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {detectInputType(inputValue).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleScrape}
                    disabled={isLoading || !inputValue.trim()}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 transition-all hover:shadow-md"
                  >
                    {isLoading ? (
                      <RefreshCw size={15} className="animate-spin" />
                    ) : (
                      <Zap size={15} />
                    )}
                    {isLoading ? "Buscando..." : "Buscar empresa"}
                  </button>
                </div>
                <p className="mt-2 text-[11px] text-gray-400 dark:text-gray-500">
                  Pega una URL de InformaColombia, el nombre de la empresa o su NIT. Se detecta automáticamente.
                </p>
              </div>

              {/* Loading */}
              {isLoading && <LoadingSkeleton step={loadingStep} />}

              {/* Error */}
              {!isLoading && scrapeError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-800/50 dark:bg-red-950/30">
                  <div className="flex items-start gap-3">
                    <XCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                        Error al extraer datos
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                        {scrapeError}
                      </p>
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={handleScrape}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition-colors"
                        >
                          <RefreshCw size={12} />
                          Reintentar
                        </button>
                        <button
                          onClick={() => setActiveTab("manual")}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                        >
                          <FileText size={12} />
                          Modo manual
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Preview */}
              {!isLoading && scrapedData && (
                <PreviewCard
                  data={scrapedData}
                  onSave={handleSave}
                  onCancel={() => {
                    setScrapedData(null);
                    setScrapeError("");
                  }}
                  saving={saving}
                />
              )}

              {/* Empty state */}
              {!isLoading && !scrapedData && !scrapeError && (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 py-14 dark:border-gray-800">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 mb-3">
                    <Building2 size={24} className="text-indigo-500 dark:text-indigo-400" />
                  </div>
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                    Ingresa una empresa para comenzar
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-600 mt-1 text-center max-w-xs">
                    Pega la URL de InformaColombia, el nombre o NIT. El sistema extraerá automáticamente toda la información B2B.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Tab: Manual ── */}
          {activeTab === "manual" && (
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">
                  Pega HTML, texto o contenido copiado
                </label>
                <textarea
                  value={manualContent}
                  onChange={(e) => {
                    setManualContent(e.target.value);
                    setManualError("");
                  }}
                  placeholder="Pega aquí el HTML de la página, texto copiado del sitio web, o cualquier contenido con información de la empresa..."
                  rows={10}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-mono outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all resize-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:placeholder-gray-600 dark:focus:ring-indigo-900"
                />
                <div className="mt-1 flex justify-between items-center">
                  <p className="text-[11px] text-gray-400 dark:text-gray-600">
                    {manualContent.length.toLocaleString()} caracteres
                  </p>
                  {manualContent && (
                    <button
                      onClick={() => setManualContent("")}
                      className="text-[11px] text-gray-400 hover:text-red-500 transition-colors"
                    >
                      Limpiar
                    </button>
                  )}
                </div>
              </div>

              {manualError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800/50 dark:bg-red-950/30">
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {manualError}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => handleManualExtract(false)}
                  disabled={manualLoading || !manualContent.trim()}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-60 transition-all dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  {manualLoading ? (
                    <RefreshCw size={15} className="animate-spin" />
                  ) : (
                    <Search size={15} />
                  )}
                  Extraer con regex
                </button>
                <button
                  onClick={() => handleManualExtract(true)}
                  disabled={manualLoading || !manualContent.trim()}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-sm font-semibold text-white hover:from-indigo-700 hover:to-purple-700 disabled:opacity-60 transition-all shadow-sm hover:shadow-md"
                >
                  {manualLoading ? (
                    <RefreshCw size={15} className="animate-spin" />
                  ) : (
                    <Sparkles size={15} />
                  )}
                  Extraer con IA
                </button>
              </div>

              <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-4 dark:bg-indigo-950/30 dark:border-indigo-900/50">
                <div className="flex gap-3">
                  <Star size={14} className="text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                      Extracción con IA
                    </p>
                    <p className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-0.5 leading-relaxed">
                      La IA interpreta el contenido y convierte cualquier texto en JSON estructurado con todos los campos del CRM. Funciona incluso con contenido mal formateado.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Tab: History ── */}
          {activeTab === "history" && (
            <div className="p-6 space-y-4">
              {/* Filters */}
              <div className="flex flex-wrap gap-2 items-center">
                <div className="flex flex-1 min-w-[200px] items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 focus-within:border-indigo-400 focus-within:bg-white transition-colors dark:border-gray-700 dark:bg-gray-800">
                  <Search size={13} className="text-gray-400 shrink-0" />
                  <input
                    type="text"
                    value={historyFilter}
                    onChange={(e) => setHistoryFilter(e.target.value)}
                    placeholder="Buscar en historial..."
                    className="flex-1 bg-transparent text-sm placeholder-gray-400 outline-none dark:text-gray-200 dark:placeholder-gray-500"
                  />
                </div>
                <select
                  value={historyStatus}
                  onChange={(e) => setHistoryStatus(e.target.value)}
                  className="rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-600 outline-none focus:border-indigo-400 cursor-pointer dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                  <option value="">Todos los estados</option>
                  <option value="success">Exitoso</option>
                  <option value="error">Error</option>
                </select>
                <button
                  onClick={() => exportCSV(filteredHistory)}
                  disabled={filteredHistory.length === 0}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                  <Download size={13} />
                  Exportar CSV
                </button>
                {history.length > 0 && (
                  <button
                    onClick={() => {
                      setHistory([]);
                      setStats({ total: 0, successful: 0, failed: 0 });
                    }}
                    className="text-xs text-red-500 hover:text-red-600 transition-colors"
                  >
                    Limpiar
                  </button>
                )}
              </div>

              {/* Table */}
              <div className="rounded-2xl border border-gray-200 overflow-hidden dark:border-gray-800">
                <table className="min-w-full text-left">
                  <thead className="border-b border-gray-100 bg-gray-50/80 dark:border-gray-800 dark:bg-gray-800/50">
                    <tr>
                      {[
                        "Estado",
                        "Input",
                        "Empresa",
                        "Método",
                        "Score",
                        "Duración",
                        "Fecha",
                        "CRM",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-4 py-12 text-center text-sm text-gray-400 dark:text-gray-500"
                        >
                          {history.length === 0
                            ? "Sin historial de scraping aún"
                            : "No hay resultados para los filtros aplicados"}
                        </td>
                      </tr>
                    ) : (
                      filteredHistory.map((item) => (
                        <tr
                          key={item.id}
                          className="border-t border-gray-100 hover:bg-gray-50 transition-colors dark:border-gray-800 dark:hover:bg-gray-800/50"
                        >
                          <td className="px-4 py-3">
                            {item.status === "success" ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700 dark:bg-green-900/40 dark:text-green-300">
                                <CheckCircle2 size={10} />
                                OK
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700 dark:bg-red-900/40 dark:text-red-300">
                                <XCircle size={10} />
                                Error
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 max-w-[180px]">
                            <p className="text-xs text-gray-600 truncate dark:text-gray-400">
                              {item.input}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                              {item.company?.razonSocial ?? "—"}
                            </p>
                            {item.company?.ciudad && (
                              <p className="text-[10px] text-gray-400 dark:text-gray-500">
                                {item.company.ciudad}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <MethodBadge method={item.method} />
                          </td>
                          <td className="px-4 py-3">
                            {item.company?.qualityScore != null ? (
                              <span
                                className={`text-xs font-bold ${
                                  item.company.qualityScore >= 75
                                    ? "text-green-600 dark:text-green-400"
                                    : item.company.qualityScore >= 50
                                    ? "text-amber-600 dark:text-amber-400"
                                    : "text-red-500 dark:text-red-400"
                                }`}
                              >
                                {item.company.qualityScore}
                              </span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-400 dark:text-gray-500">
                            {formatDuration(item.duration)}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                            {formatDate(item.timestamp)}
                          </td>
                          <td className="px-4 py-3">
                            {item.saved ? (
                              <span className="text-[10px] text-green-600 dark:text-green-400 font-semibold">
                                Guardado ✓
                              </span>
                            ) : item.status === "success" ? (
                              <button
                                onClick={() => {
                                  if (item.company) {
                                    setScrapedData(item.company);
                                    setActiveTab("auto");
                                  }
                                }}
                                className="text-[10px] text-indigo-600 hover:underline dark:text-indigo-400 font-semibold"
                              >
                                Guardar
                              </button>
                            ) : (
                              <span className="text-gray-300 dark:text-gray-600">—</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

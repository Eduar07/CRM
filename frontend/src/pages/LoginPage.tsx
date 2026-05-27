import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { Moon, Sun, Eye, EyeOff, AlertCircle } from "lucide-react";
import { login } from "../services/auth.service";
import { useTheme } from "../context/ThemeContext";

type LoginErrorResponse = {
  message?: string;
  error?: string;
};

function getErrorMessage(err: unknown): string {
  if (err instanceof AxiosError) {
    if (!err.response) {
      return "No se pudo conectar con el servidor. ¿Está el backend corriendo en el puerto 8080?";
    }
    const body = err.response.data as LoginErrorResponse | undefined;
    if (body?.message) return body.message;
    if (err.response.status === 401) return "Credenciales inválidas";
    if (err.response.status === 403) return "Acceso denegado";
    if (err.response.status >= 500) return "Error interno del servidor";
  }
  return "Error de autenticación";
}

export function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
      navigate("/");
    } catch (err) {
      setError(getErrorMessage(err));
      setShakeKey((k) => k + 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden p-4"
      style={{ background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)" }}
    >
      {/* Animated background blobs */}
      <div
        className="login-blob-1 pointer-events-none absolute -top-40 -left-40 h-[28rem] w-[28rem] rounded-full blur-3xl"
        style={{ backgroundColor: "rgba(99, 102, 241, 0.22)" }}
      />
      <div
        className="login-blob-2 pointer-events-none absolute -bottom-40 -right-40 h-[32rem] w-[32rem] rounded-full blur-3xl"
        style={{ backgroundColor: "rgba(139, 92, 246, 0.18)" }}
      />
      <div
        className="login-blob-3 pointer-events-none absolute top-1/2 left-1/3 h-64 w-64 -translate-y-1/2 rounded-full blur-2xl"
        style={{ backgroundColor: "rgba(99, 102, 241, 0.1)" }}
      />

      {/* Subtle grid overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      {/* Theme toggle */}
      <button
        onClick={toggle}
        className="fixed top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full transition-all"
        style={{
          border: "1px solid rgba(255,255,255,0.12)",
          backgroundColor: "rgba(255,255,255,0.08)",
          color: "rgba(255,255,255,0.6)",
          backdropFilter: "blur(8px)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(255,255,255,0.16)";
          (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.9)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(255,255,255,0.08)";
          (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.6)";
        }}
        aria-label="Cambiar tema"
      >
        {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
      </button>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-[400px]">
        {/* Logo & brand */}
        <div className="mb-8 flex flex-col items-center text-center animate-fade-in-up">
          <div className="relative mb-5">
            <div
              className="animate-pulse-ring absolute inset-0 rounded-2xl"
              style={{ backgroundColor: "rgba(99, 102, 241, 0.4)" }}
            />
            <div
              className="animate-pulse-ring absolute inset-0 rounded-2xl delay-300"
              style={{ backgroundColor: "rgba(99, 102, 241, 0.2)" }}
            />
            <div
              className="relative flex h-[68px] w-[68px] items-center justify-center rounded-2xl"
              style={{
                background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                boxShadow: "0 20px 40px rgba(99, 102, 241, 0.45), 0 0 0 1px rgba(255,255,255,0.1)",
              }}
            >
              <span className="text-[26px] font-bold text-white select-none">C</span>
            </div>
          </div>
          <h1 className="text-[22px] font-bold tracking-tight text-white">Campusland CRM</h1>
          <p className="mt-1 text-sm" style={{ color: "rgba(165, 180, 252, 0.7)" }}>
            Sistema de gestión de prospectos
          </p>
        </div>

        {/* Card */}
        <div
          className="animate-scale-in delay-150 rounded-3xl p-8"
          style={{
            border: "1px solid rgba(255,255,255,0.1)",
            backgroundColor: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            boxShadow: "0 32px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
        >
          <div className="mb-6">
            <h2 className="text-[17px] font-semibold text-white">Iniciar sesión</h2>
            <p className="mt-0.5 text-sm" style={{ color: "rgba(255,255,255,0.38)" }}>
              Ingresa tus credenciales para continuar
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {/* Username */}
            <div className="animate-fade-in-up delay-200">
              <label
                className="mb-1.5 block text-xs font-medium"
                style={{ color: "rgba(199, 210, 254, 0.8)" }}
              >
                Usuario
              </label>
              <input
                className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none transition-all"
                style={{
                  border: "1px solid rgba(255,255,255,0.1)",
                  backgroundColor: "rgba(255,255,255,0.06)",
                  caretColor: "#a5b4fc",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border = "1px solid rgba(99, 102, 241, 0.6)";
                  e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.15)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = "1px solid rgba(255,255,255,0.1)";
                  e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)";
                  e.currentTarget.style.boxShadow = "none";
                }}
                placeholder="tu_usuario"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div className="animate-fade-in-up delay-300">
              <label
                className="mb-1.5 block text-xs font-medium"
                style={{ color: "rgba(199, 210, 254, 0.8)" }}
              >
                Contraseña
              </label>
              <div className="relative">
                <input
                  className="w-full rounded-xl px-4 py-3 pr-12 text-sm text-white outline-none transition-all"
                  style={{
                    border: "1px solid rgba(255,255,255,0.1)",
                    backgroundColor: "rgba(255,255,255,0.06)",
                    caretColor: "#a5b4fc",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.border = "1px solid rgba(99, 102, 241, 0.6)";
                    e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.15)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = "1px solid rgba(255,255,255,0.1)";
                    e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-all"
                  style={{ color: "rgba(255,255,255,0.28)" }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.65)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.28)")
                  }
                  tabIndex={-1}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                key={shakeKey}
                className="animate-shake flex items-start gap-2.5 rounded-xl px-4 py-3"
                style={{
                  border: "1px solid rgba(239, 68, 68, 0.25)",
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                }}
              >
                <AlertCircle size={14} className="mt-0.5 shrink-0" style={{ color: "#f87171" }} />
                <p className="text-xs" style={{ color: "#fca5a5" }}>
                  {error}
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              className="animate-fade-in-up delay-400 mt-2 w-full rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all disabled:cursor-not-allowed disabled:opacity-55"
              style={{
                background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                boxShadow: "0 8px 24px rgba(99, 102, 241, 0.3)",
              }}
              onMouseEnter={(e) => {
                if (!(e.currentTarget as HTMLButtonElement).disabled) {
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow =
                    "0 12px 32px rgba(99, 102, 241, 0.45)";
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 8px 24px rgba(99, 102, 241, 0.3)";
              }}
              onMouseDown={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
              }}
              type="submit"
              disabled={loading || !username || !password}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin-slow h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                      style={{ opacity: 0.25 }}
                    />
                    <path
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      style={{ opacity: 0.8 }}
                    />
                  </svg>
                  Iniciando sesión...
                </span>
              ) : (
                "Entrar"
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p
          className="mt-6 text-center text-xs animate-fade-in delay-600"
          style={{ color: "rgba(255,255,255,0.2)" }}
        >
          Campusland · CRM v1.0 · {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}

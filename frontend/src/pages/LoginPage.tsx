import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { login } from "../services/auth.service";

type LoginErrorResponse = {
  message?: string;
  error?: string;
};

function getErrorMessage(err: unknown): string {
  if (err instanceof AxiosError) {
    // Sin respuesta del servidor → backend apagado o CORS
    if (!err.response) {
      return "No se pudo conectar con el servidor. ¿Está el backend corriendo en el puerto 8080?";
    }
    // Respuesta con error del servidor
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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(username, password);
      navigate("/");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-base font-bold text-white">
            C
          </div>
          <div>
            <p className="text-base font-bold text-gray-900">Campusland</p>
            <p className="text-xs text-gray-400">CRM v1.0</p>
          </div>
        </div>

        <form
          onSubmit={submit}
          className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm"
        >
          <h1 className="text-xl font-bold text-gray-900">Iniciar sesión</h1>
          <p className="mt-1 text-sm text-gray-500">Acceso al CRM de prospección</p>

          <div className="mt-6 space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Usuario
              </label>
              <input
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                placeholder="marcela"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Contraseña
              </label>
              <input
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                {error}
              </div>
            )}

            <button
              className="mt-1 w-full rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-60"
              type="submit"
              disabled={loading || !username || !password}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

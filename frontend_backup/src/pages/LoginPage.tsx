import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { login } from "../services/auth.service";

type LoginErrorResponse = {
  message?: string;
};

export function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      await login(username, password);
      navigate("/");
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        const apiError = err.response?.data as LoginErrorResponse | undefined;
        setError(apiError?.message ?? "Error de autenticación");
        return;
      }
      setError("Error de autenticación");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-3xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Iniciar sesión</h1>
        <p className="mt-1 text-sm text-slate-500">Acceso al CRM de prospección</p>

        <div className="mt-6 space-y-4">
          <input
            className="w-full rounded-2xl border px-4 py-3 outline-none focus:ring-2"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            className="w-full rounded-2xl border px-4 py-3 outline-none focus:ring-2"
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="w-full rounded-2xl bg-slate-900 px-4 py-3 font-medium text-white" type="submit">
            Entrar
          </button>
        </div>
      </form>
    </div>
  );
}

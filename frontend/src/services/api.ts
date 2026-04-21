import axios, { AxiosHeaders, AxiosError, type InternalAxiosRequestConfig } from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8080/api",
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    const headers = AxiosHeaders.from(config.headers);
    headers.set("Authorization", `Bearer ${token}`);
    config.headers = headers;
  }

  return config;
});

/**
 * FIX: Interceptor de respuesta que convierte errores HTTP en mensajes legibles.
 * Extrae el `message` del ApiErrorResponse del backend y distingue códigos de negocio:
 *   - 409 Conflict  → regla anti-spam / solapamiento
 *   - 422 Unprocessable → regla de negocio violada
 *   - 400 Bad Request → datos mal formados
 */
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; error?: string }>) => {
    const status = error.response?.status;
    const backendMsg = error.response?.data?.message;

    let friendlyMsg: string;
    switch (status) {
      case 400:
        friendlyMsg = backendMsg ?? "Datos inválidos. Revisa el formulario.";
        break;
      case 401:
        friendlyMsg = "Sesión expirada. Vuelve a iniciar sesión.";
        break;
      case 403:
        friendlyMsg = "No tienes permisos para esta acción.";
        break;
      case 404:
        friendlyMsg = backendMsg ?? "Recurso no encontrado.";
        break;
      case 409:
        friendlyMsg = backendMsg ?? "Conflicto: esta acción choca con una regla de negocio.";
        break;
      case 422:
        friendlyMsg = backendMsg ?? "No se puede procesar la petición.";
        break;
      case 500:
        friendlyMsg = "Error interno del servidor. Intenta de nuevo en unos minutos.";
        break;
      default:
        friendlyMsg = backendMsg ?? error.message ?? "Error desconocido";
    }

    // Adjuntar el mensaje amigable para que los componentes lo usen
    const enriched = new Error(friendlyMsg) as Error & { status?: number; raw?: unknown };
    enriched.status = status;
    enriched.raw = error.response?.data;
    return Promise.reject(enriched);
  }
);

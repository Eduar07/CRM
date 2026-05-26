import { URL } from "url";

const BLOCKED_HOSTS = [
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "169.254.", // link-local
  "10.",
  "172.16.",
  "172.17.",
  "192.168.",
  "metadata.google.internal",
  "169.254.169.254", // AWS metadata
];

const ALLOWED_PROTOCOLS = ["http:", "https:"];

export function validateURL(raw) {
  if (!raw || typeof raw !== "string") {
    return { valid: false, error: "URL inválida" };
  }

  let url;
  try {
    url = new URL(raw.trim());
  } catch {
    return { valid: false, error: "URL mal formada" };
  }

  if (!ALLOWED_PROTOCOLS.includes(url.protocol)) {
    return { valid: false, error: "Solo se permiten URLs http/https" };
  }

  // SSRF protection: block private/internal IPs
  const host = url.hostname.toLowerCase();
  for (const blocked of BLOCKED_HOSTS) {
    if (host === blocked || host.startsWith(blocked)) {
      return { valid: false, error: "URL no permitida (host privado)" };
    }
  }

  return { valid: true, url };
}

export function validateInput(input) {
  if (!input || typeof input !== "string") {
    return { valid: false, error: "El input no puede estar vacío" };
  }

  const trimmed = input.trim();

  if (trimmed.length < 2) {
    return { valid: false, error: "El input es demasiado corto" };
  }

  if (trimmed.length > 500) {
    return { valid: false, error: "El input es demasiado largo (máx. 500 chars)" };
  }

  // Detect script injection attempts
  if (/<script|javascript:|data:/i.test(trimmed)) {
    return { valid: false, error: "Input contiene contenido no permitido" };
  }

  return { valid: true };
}

export function validateContent(content) {
  if (!content || typeof content !== "string") {
    return { valid: false, error: "Contenido vacío" };
  }

  if (content.length > 500_000) {
    return { valid: false, error: "Contenido demasiado grande (máx. 500KB)" };
  }

  return { valid: true };
}

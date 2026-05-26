// ─── Colombian phone validation ────────────────────────────────────────────────
// Mobile: starts with 3, exactly 10 digits (300-399)
// Landline local: 7 digits (written without area code)
// Landline national: area code (1 digit) + 7 digits = 8 digits, or with +57 = 11
const MOBILE_RE = /^3[0-9]{9}$/;
const LANDLINE_LOCAL_RE = /^[1-9][0-9]{6}$/;         // 7-digit local
const LANDLINE_NATIONAL_RE = /^[1-9][0-9]{9}$/;      // 10-digit with area

// Emails to always ignore
const BLOCKED_EMAIL_DOMAINS = new Set([
  "sentry.io", "bugsnag.com", "newrelic.com", "datadog.com",
  "googletagmanager.com", "google-analytics.com", "analytics.google.com",
  "facebook.com", "twitter.com", "instagram.com", "linkedin.com",
  "gravatar.com", "amazonaws.com", "cloudfront.net", "cloudflare.com",
  "w3.org", "schema.org", "example.com", "example.org", "test.com",
  "wix.com", "wordpress.com", "squarespace.com",
]);

const BLOCKED_EMAIL_PREFIXES = new Set([
  "noreply", "no-reply", "donotreply", "do-not-reply",
  "unsubscribe", "bounce", "mailer-daemon", "postmaster",
  "webmaster", "abuse", "spam", "support@support",
  "notifications", "alerts", "newsletter",
]);

// Colombian departments and cities (ordered longest-first to avoid partial matches)
const DEPARTAMENTOS = [
  "Norte de Santander", "Valle del Cauca", "San Andrés",
  "Cundinamarca", "Barranquilla", "Bucaramanga", "Villavicencio",
  "Barrancabermeja", "Floridablanca", "Piedecuesta",
  "Amazonas", "Antioquia", "Atlántico", "Bolívar", "Boyacá",
  "Caldas", "Caquetá", "Casanare", "Cauca", "Cesar", "Chocó",
  "Córdoba", "Guainía", "Guaviare", "Huila", "La Guajira",
  "Magdalena", "Meta", "Nariño", "Putumayo", "Quindío",
  "Risaralda", "Santander", "Sucre", "Tolima", "Vaupés", "Vichada",
  "Bogotá", "Medellín", "Cartagena", "Cúcuta", "Ibagué",
  "Manizales", "Pereira", "Santa Marta", "Pasto", "Montería",
  "Armenia", "Sincelejo", "Valledupar", "Popayán", "Neiva", "Tunja",
  "Soledad", "Bello", "Itagüí", "Envigado", "Palmira", "Buga",
  "Tuluá", "Girón", "Apartadó", "Tumaco", "Riohacha", "Girardot",
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function digitsOnly(str) {
  return str.replace(/\D/g, "");
}

function dedup(arr) {
  return [...new Set(arr.map((x) => String(x).trim()).filter(Boolean))];
}

/**
 * Validate and normalize a raw phone string into a clean Colombian number.
 * Returns null if it doesn't look like a real Colombian number.
 */
export function cleanAndValidatePhone(raw) {
  if (!raw) return null;
  let digits = digitsOnly(raw);

  // Strip leading country code +57 / 0057
  if (digits.startsWith("0057")) digits = digits.slice(4);
  else if (digits.startsWith("57") && digits.length > 10) digits = digits.slice(2);

  if (MOBILE_RE.test(digits)) {
    return digits.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3");
  }
  if (LANDLINE_NATIONAL_RE.test(digits)) {
    // area(1) + local(7) → "(7) 637 1234"
    const area = digits[0];
    const local = digits.slice(1);
    return `(${area}) ${local.slice(0, 3)} ${local.slice(3)}`;
  }
  if (LANDLINE_LOCAL_RE.test(digits)) {
    return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  }

  return null; // not a valid Colombian number
}

export function isMobilePhone(formatted) {
  const d = digitsOnly(formatted);
  return MOBILE_RE.test(d);
}

/**
 * Validate email: must pass syntax check, not be a blocked prefix/domain,
 * and domain must have a real TLD.
 */
export function isValidEmail(email) {
  if (!email || typeof email !== "string") return false;
  const e = email.trim().toLowerCase();

  // Basic syntax
  if (!/^[^\s@]{1,64}@[^\s@]{1,255}\.[a-z]{2,}$/.test(e)) return false;

  const [prefix, domain] = e.split("@");

  // Blocked prefix
  if (BLOCKED_EMAIL_PREFIXES.has(prefix)) return false;
  for (const bp of BLOCKED_EMAIL_PREFIXES) {
    if (prefix.startsWith(bp)) return false;
  }

  // Blocked domain
  if (BLOCKED_EMAIL_DOMAINS.has(domain)) return false;
  for (const bd of BLOCKED_EMAIL_DOMAINS) {
    if (domain.endsWith(bd)) return false;
  }

  // Reject obvious fakes
  if (e.includes("example") || e.includes("placeholder") || e.includes("youremail")) return false;

  return true;
}

/**
 * Extract phones from raw text.
 * Strategy 1 (high confidence): number appears right after a contact label.
 * Strategy 2 (fallback): any sequence that strictly validates as a Colombian number.
 */
export function extractPhonesFromText(text) {
  if (!text) return [];

  const found = [];

  // Strategy 1: context-aware — label followed by a number
  const contextRe =
    /(?:tel(?:éfono|efono)?s?\.?|cel(?:ular)?\.?|móvil|movil|fax|pbx|whatsapp|contacto|comunícate|llámanos|llame|llámenos|comuníquese|número)[^\d\n]{0,40}([\d][\d\s\-\.\(\)/]{5,18}[\d])/gi;

  let m;
  while ((m = contextRe.exec(text)) !== null) {
    const c = cleanAndValidatePhone(m[1]);
    if (c) found.push(c);
  }

  // Strategy 2: fallback — scan for all digit sequences and validate strictly
  // Only runs when Strategy 1 found nothing, to avoid false positives
  if (found.length === 0) {
    // Match digit groups with optional formatting chars (spaces, dashes, dots, parens)
    const broadRe = /(?<!\d)(\(?\d{1,3}\)?[\s\-.]?\d{3}[\s\-.]?\d{3}[\s\-.]?\d{0,4})(?!\d)/g;
    while ((m = broadRe.exec(text)) !== null) {
      const c = cleanAndValidatePhone(m[1]);
      if (c) found.push(c);
    }
  }

  return dedup(found);
}

/**
 * Extract emails from raw text using CONTEXT-AWARE matching.
 * Only captures emails near a contact-related label.
 */
export function extractEmailsFromText(text) {
  if (!text) return [];

  // Must appear near an email-related label
  const contextRe =
    /(?:e[-\s]?mail|correo|mail|contacto|información|escríbenos|escríbanos|envía|contáctanos|contáctenos)[^\w\n]{0,50}([a-zA-Z0-9._%+\-]{1,64}@[a-zA-Z0-9.\-]{1,255}\.[a-zA-Z]{2,})/gi;

  const found = [];
  let m;
  while ((m = contextRe.exec(text)) !== null) {
    if (isValidEmail(m[1])) found.push(m[1].toLowerCase());
  }
  return dedup(found);
}

/**
 * Extract NIT colombiano from text.
 * Format: 9 digits + optional hyphen + 1 check digit.
 * Must be preceded or followed by the word "NIT" or "nit".
 */
export function extractNIT(text) {
  if (!text) return null;

  // NIT label followed by the number
  const nitLabeled = /\bNIT[^0-9]{0,10}(\d{3}[.\s]?\d{3}[.\s]?\d{3}[-\s]?\d)/gi;
  let m = nitLabeled.exec(text);
  if (m) return normalizeNIT(m[1]);

  // The number followed by NIT label
  const nitAfter = /(\d{3}[.\s]?\d{3}[.\s]?\d{3}[-\s]?\d)[^0-9]{0,10}\bNIT/gi;
  m = nitAfter.exec(text);
  if (m) return normalizeNIT(m[1]);

  return null;
}

function normalizeNIT(raw) {
  const clean = raw.replace(/[\s.]/g, "");
  const digits = clean.replace(/[-]/, "");
  if (digits.length >= 10) {
    return `${digits.slice(0, 9)}-${digits.slice(9, 10)}`;
  }
  if (digits.length === 9) return digits;
  return raw.trim();
}

/**
 * Detect the most prominent departamento mentioned in text.
 * Tries longest names first to avoid "Norte de Santander" being matched as "Santander".
 */
export function detectDepartamento(text) {
  if (!text) return null;
  const lower = text.toLowerCase();
  return DEPARTAMENTOS.find((d) => {
    const re = new RegExp(`\\b${d.toLowerCase()}\\b`);
    return re.test(lower);
  }) ?? null;
}

export function detectCiudad(text) {
  return detectDepartamento(text); // DEPARTAMENTOS list already includes cities
}

export function extractIndustria(text) {
  if (!text) return null;
  const lower = text.toLowerCase();
  const map = [
    ["Tecnología",          ["software", "sistemas", " ti ", "tech", "digital", "informática", "aplicacion", "programacion"]],
    ["Educación",           ["educación", "colegio", "universidad", "instituto", "enseñanza", "capacitación", "formación"]],
    ["Salud",               ["salud", "clínica", "hospital", "médico", "farmacéutic", "eps", "ips", "laboratorio clínico"]],
    ["Construcción",        ["construcción", "inmobiliaria", "obras civiles", "contratista", "edificio", "infraestructura"]],
    ["Manufactura",         ["manufactura", "fabricación", "producción", "planta industrial", "ensamble"]],
    ["Comercio",            ["distribución", "comercialización", "retail", "almacén", "tienda", "punto de venta"]],
    ["Agroindustria",       ["agro", "agroindustria", "agricultura", "ganadería", "cultivo", "pecuario"]],
    ["Logística",           ["logística", "transporte de carga", "bodegaje", "envíos", "mensajería", "flota"]],
    ["Servicios Financieros",["financiero", "banco", "crédito", "seguros", "inversión", "fiduciaria", "leasing"]],
    ["Energía",             ["energía", "petróleo", "gas natural", "minería", "eléctrico", "solar", "renovable"]],
  ];
  for (const [industry, keywords] of map) {
    if (keywords.some((k) => lower.includes(k))) return industry;
  }
  return null;
}

/**
 * Try to detect a company name from plain text by looking for legal suffixes.
 * Returns null if nothing conclusive found.
 */
export function extractCompanyNameFromText(text) {
  if (!text) return null;
  const re = /([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑA-Za-z0-9\s&.,'-]{2,60}(?:S\.A\.S|SAS|S\.A\.|LTDA|LIMITADA|E\.U\.|E\.U|CIA\.|COMPAÑÍA|CORP|INC|GROUP|HOLDINGS)\b)/g;
  const matches = text.match(re);
  if (!matches || matches.length === 0) return null;
  // Prefer the first one that's not too long
  const best = matches.find((m) => m.trim().length <= 80);
  return best ? best.trim() : null;
}

export function extractSocialLinks(html) {
  const social = { linkedin: null, facebook: null, instagram: null, twitter: null, youtube: null };
  const patterns = {
    linkedin:  /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/company\/[a-zA-Z0-9\-_./%]+/i,
    facebook:  /(?:https?:\/\/)?(?:www\.)?facebook\.com\/(?!sharer|share)[a-zA-Z0-9.\-_/]+/i,
    instagram: /(?:https?:\/\/)?(?:www\.)?instagram\.com\/[a-zA-Z0-9.\-_]+\/?/i,
    twitter:   /(?:https?:\/\/)?(?:www\.)?(?:twitter|x)\.com\/(?!intent|share)[a-zA-Z0-9.\-_]+/i,
    youtube:   /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:channel|c|user)\/[a-zA-Z0-9.\-_]+/i,
  };
  for (const [net, re] of Object.entries(patterns)) {
    const m = html.match(re);
    if (m) social[net] = m[0].startsWith("http") ? m[0] : `https://${m[0]}`;
  }
  return social;
}

export function calculateQualityScore(data) {
  const weights = {
    razonSocial: 20, nit: 15, telefonos: 10, celulares: 10, emails: 10,
    website: 5, ciudad: 5, departamento: 5, direccion: 5, industria: 5,
    empleados: 3, representanteLegal: 5, estadoEmpresa: 2,
  };
  let score = 0;
  if (data.razonSocial) score += weights.razonSocial;
  if (data.nit) score += weights.nit;
  if ((data.telefonos ?? []).length > 0) score += weights.telefonos;
  if ((data.celulares ?? []).length > 0) score += weights.celulares;
  if ((data.emails ?? []).length > 0) score += weights.emails;
  if (data.website) score += weights.website;
  if (data.ciudad) score += weights.ciudad;
  if (data.departamento) score += weights.departamento;
  if (data.direccion) score += weights.direccion;
  if (data.industria) score += weights.industria;
  if (data.empleados) score += weights.empleados;
  if (data.representanteLegal) score += weights.representanteLegal;
  if (data.estadoEmpresa) score += weights.estadoEmpresa;
  return Math.min(100, score);
}

export function buildEmpty() {
  return {
    razonSocial: "", nombreComercial: null, nit: null,
    telefonos: [], celulares: [], emails: [], website: null,
    ciudad: null, departamento: null, direccion: null,
    actividadEconomica: null, industria: null, empleados: null,
    representanteLegal: null, estadoEmpresa: null,
    redesSociales: {}, descripcion: null, keywords: [], qualityScore: 0,
  };
}

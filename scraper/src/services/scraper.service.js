import * as cheerio from "cheerio";
import {
  cleanAndValidatePhone,
  isMobilePhone,
  isValidEmail,
  extractPhonesFromText,
  extractEmailsFromText,
  extractNIT,
  detectDepartamento,
  extractIndustria,
  extractCompanyNameFromText,
  extractSocialLinks,
  calculateQualityScore,
  buildEmpty,
} from "../utils/data.extractor.js";
import { validateURL } from "../utils/validators.js";

// Rotate user-agents to avoid simple bot detection
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64; rv:125.0) Gecko/20100101 Firefox/125.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15",
  "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.69 Mobile Safari/537.36",
];

// DOM elements that add noise and data from other companies
const NOISE_SELECTORS = [
  "nav", "header", "footer", "aside",
  '[class*="relacionad"]', '[class*="similar"]', '[class*="otras-empresa"]',
  '[class*="sugerencia"]', '[class*="recomend"]',
  '[id*="relacionad"]', '[id*="similar"]', '[id*="otras"]',
  '[class*="sidebar"]', '[class*="banner"]', '[class*="publicidad"]',
  '[class*="anuncio"]', '[class*="cookie"]', '[class*="popup"]',
  '[class*="modal"]', '[class*="newsletter"]', '[class*="suscri"]',
  ".breadcrumb", '[class*="breadcrumb"]',
  '[class*="pagination"]', '[class*="paginacion"]',
  "script", "style", "noscript", "iframe", "img", "svg",
].join(", ");

// ─── HTTP fetch with timeout and configurable user-agent ───────────────────────
async function fetchHTML(url, uaIndex = 0) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": USER_AGENTS[uaIndex % USER_AGENTS.length],
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "es-CO,es;q=0.9,en-US;q=0.8,en;q=0.7",
        "Accept-Encoding": "gzip, deflate, br",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
        "Upgrade-Insecure-Requests": "1",
      },
      redirect: "follow",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

// ─── DOM parser — scoped to main company content only ─────────────────────────
function parseCompanyFromDOM(html, baseUrl) {
  const $ = cheerio.load(html);
  const result = buildEmpty();
  result.sourceUrl = baseUrl;

  // Step 1: JSON-LD structured data (most reliable)
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const json = JSON.parse($(el).html() || "{}");
      const nodes = Array.isArray(json["@graph"]) ? json["@graph"] : [json];
      const org = nodes.find((g) =>
        ["Organization", "LocalBusiness", "Corporation"].includes(g["@type"])
      );
      if (!org) return;

      result.razonSocial  ||= org.name?.trim() ?? null;
      result.website      ||= org.url?.trim() ?? null;
      result.descripcion  ||= org.description?.trim().slice(0, 400) ?? null;

      if (org.address) {
        result.direccion    ||= org.address.streetAddress?.trim() ?? null;
        result.ciudad       ||= org.address.addressLocality?.trim() ?? null;
        result.departamento ||= org.address.addressRegion?.trim() ?? null;
      }

      const phones = Array.isArray(org.telephone) ? org.telephone : [org.telephone].filter(Boolean);
      phones.forEach((p) => {
        const c = cleanAndValidatePhone(String(p));
        if (c) (isMobilePhone(c) ? result.celulares : result.telefonos).push(c);
      });

      const emails = Array.isArray(org.email) ? org.email : [org.email].filter(Boolean);
      emails.filter(isValidEmail).forEach((e) => result.emails.push(e.toLowerCase()));

      const links = Array.isArray(org.sameAs) ? org.sameAs : [org.sameAs].filter(Boolean);
      for (const link of links) {
        if (link.includes("linkedin.com/company"))  result.redesSociales.linkedin  ||= link;
        else if (link.includes("facebook.com"))     result.redesSociales.facebook  ||= link;
        else if (link.includes("instagram.com"))    result.redesSociales.instagram ||= link;
        else if (link.includes("twitter.com") || link.includes("x.com"))
                                                    result.redesSociales.twitter   ||= link;
      }
    } catch { /* ignore malformed JSON-LD */ }
  });

  // Step 2: Meta tags
  const ogTitle  = $('meta[property="og:title"]').attr("content")?.trim();
  const ogDesc   = $('meta[property="og:description"]').attr("content")?.trim();
  const metaDesc = $('meta[name="description"]').attr("content")?.trim();
  result.descripcion ||= ogDesc || metaDesc || null;

  // Step 3: Cut off "related companies" sections before removing noise
  $("h2, h3, h4, section, div").each((_, el) => {
    const txt = $(el).text().trim().toLowerCase();
    if (
      (txt.startsWith("empresa") && txt.includes("relacionad")) ||
      txt.startsWith("otras empresa") ||
      txt.startsWith("más empresa") ||
      txt.startsWith("directorio") ||
      txt.startsWith("resultados de búsqueda")
    ) {
      $(el).nextAll().remove();
      $(el).remove();
      return false;
    }
  });

  $(NOISE_SELECTORS).remove();

  // Step 4: tel: links — highest confidence for phones
  $('a[href^="tel:"]').each((_, el) => {
    const raw = $(el).attr("href").replace(/^tel:/i, "").trim();
    const cleaned = cleanAndValidatePhone(raw);
    if (cleaned) (isMobilePhone(cleaned) ? result.celulares : result.telefonos).push(cleaned);
  });

  // Step 5: mailto: links — highest confidence for emails
  $('a[href^="mailto:"]').each((_, el) => {
    const raw = $(el).attr("href").replace(/^mailto:/i, "").split("?")[0].trim().toLowerCase();
    if (isValidEmail(raw)) result.emails.push(raw);
  });

  // Step 6: Company name from headings
  if (!result.razonSocial) {
    const selectors = ["h1", "h2", ".empresa-nombre", ".company-name",
                       "[class*='empresa']", "[class*='razon-social']"];
    for (const sel of selectors) {
      const txt = $(sel).first().text().trim();
      if (!txt || txt.length > 120) continue;
      if (/S\.?A\.?S|LTDA|LIMITADA|E\.?U|S\.?A\.|CÍA|CIA\.|CORP|INC|GROUP/i.test(txt)) {
        result.razonSocial = txt; break;
      }
      if (/^[A-ZÁÉÍÓÚÑ]/.test(txt) && txt.split(" ").length <= 8 && !/[?¿!¡]/.test(txt)) {
        result.razonSocial = txt; break;
      }
    }
    // Fallback: og:title without site suffix
    if (!result.razonSocial && ogTitle) {
      const clean = ogTitle.split(/\s*[|\-–—]\s*/)[0].trim();
      if (clean.length > 2 && clean.length < 100) result.razonSocial = clean;
    }
  }

  // Step 7: NIT from dedicated DOM elements
  if (!result.nit) {
    const nitEl = $('[class*="nit" i], [id*="nit" i], [data-label*="nit" i]').first();
    if (nitEl.length) {
      const m = nitEl.text().trim().match(/\d{3}[.\s]?\d{3}[.\s]?\d{3}[-\s]?\d/);
      if (m) result.nit = normalizeNIT(m[0]);
    }
  }

  // Step 8: Address
  if (!result.direccion) {
    const txt = $('address, [class*="direcci" i], [class*="address" i], [itemprop="address"]')
      .first().text().replace(/\s+/g, " ").trim();
    if (txt.length > 5 && txt.length < 300) result.direccion = txt;
  }

  // Step 9: Legal rep
  if (!result.representanteLegal) {
    const txt = $('[class*="representante" i], [class*="legal" i], [class*="gerente" i]')
      .first().text().replace(/\s+/g, " ").trim();
    if (txt.length > 3 && txt.length < 100) result.representanteLegal = txt;
  }

  // Step 10: Company state
  if (!result.estadoEmpresa) {
    const txt = $('[class*="estado" i], [class*="status" i], [class*="activa" i]')
      .first().text().trim();
    if (txt.length < 50) result.estadoEmpresa = txt;
  }

  // Step 11: Social links
  const remainingHTML = $.html();
  const social = extractSocialLinks(remainingHTML);
  result.redesSociales.linkedin  ||= social.linkedin;
  result.redesSociales.facebook  ||= social.facebook;
  result.redesSociales.instagram ||= social.instagram;
  result.redesSociales.twitter   ||= social.twitter;
  result.redesSociales.youtube   ||= social.youtube;

  // Step 12: Text fallbacks (only when DOM extraction found nothing)
  const mainText = $("body").text().replace(/\s+/g, " ").trim();

  if (result.telefonos.length === 0 && result.celulares.length === 0) {
    extractPhonesFromText(mainText).forEach((p) =>
      (isMobilePhone(p) ? result.celulares : result.telefonos).push(p)
    );
  }
  if (result.emails.length === 0) {
    result.emails.push(...extractEmailsFromText(mainText));
  }
  result.nit          ||= extractNIT(mainText);
  result.razonSocial  ||= extractCompanyNameFromText(mainText) ?? "";
  result.departamento ||= detectDepartamento(mainText);
  result.ciudad       ||= result.departamento;
  result.industria    ||= extractIndustria(mainText);

  // Step 13: Website from links (excluding social and current domain)
  if (!result.website) {
    let baseHost = "";
    try { baseHost = new URL(baseUrl).hostname; } catch { /* empty baseUrl */ }
    const blocked = ["facebook", "instagram", "linkedin", "twitter", "youtube", "google", "wa.me", "whatsapp"];
    $('a[href^="http"]').each((_, el) => {
      if (result.website) return false;
      try {
        const u = new URL($(el).attr("href"));
        if (u.hostname !== baseHost && !blocked.some((s) => u.hostname.includes(s))) {
          result.website = u.href;
        }
      } catch { /* ignore */ }
    });
  }

  // Step 14: Keywords
  result.keywords = extractKeywords(mainText);

  // Step 15: Deduplicate
  result.telefonos = [...new Set(result.telefonos.filter(Boolean))];
  result.celulares = [...new Set(result.celulares.filter(Boolean))];
  result.emails    = [...new Set(result.emails.filter(Boolean).map((e) => e.toLowerCase()))];

  result.qualityScore = calculateQualityScore(result);
  return result;
}

function normalizeNIT(raw) {
  const nums = raw.replace(/[\s.]/g, "").replace(/[^0-9]/g, "");
  if (nums.length >= 10) return `${nums.slice(0, 9)}-${nums.slice(9, 10)}`;
  if (nums.length === 9) return nums;
  return raw.trim();
}

function extractKeywords(text) {
  const stop = new Set([
    "de","la","el","en","y","a","con","del","los","las","un","una","es","se",
    "su","por","para","que","al","colombia","colombiana","empresa","empresas",
    "información","contacto","teléfono","dirección","ciudad","departamento",
  ]);
  const freq = {};
  text.toLowerCase().replace(/[^a-záéíóúñ\s]/gi, " ").split(/\s+/)
    .filter((w) => w.length > 4 && !stop.has(w))
    .forEach((w) => { freq[w] = (freq[w] || 0) + 1; });
  return Object.entries(freq)
    .filter(([, c]) => c > 1)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([w]) => w);
}

// ─── Public API ────────────────────────────────────────────────────────────────

export async function scrapeURL(rawUrl) {
  const { valid, url, error: urlError } = validateURL(rawUrl);
  if (!valid) throw new Error(urlError);
  const urlStr = url.toString();
  let lastError;

  // Try each user-agent in sequence — most sites respond to at least one
  for (let i = 0; i < USER_AGENTS.length; i++) {
    try {
      const html = await fetchHTML(urlStr, i);
      const data = parseCompanyFromDOM(html, urlStr);
      return { data, method: "fetch" };
    } catch (err) {
      lastError = err;
      console.log(`[scraper] attempt ${i + 1}/${USER_AGENTS.length} failed: ${err.message}`);
      if (i < USER_AGENTS.length - 1) await new Promise((r) => setTimeout(r, 600 * (i + 1)));
    }
  }

  throw lastError ?? new Error("No se pudo obtener la página tras varios intentos");
}

export async function scrapeByNameOrNIT(input) {
  const encoded = encodeURIComponent(input.trim());
  return scrapeURL(`https://www.informacolombia.com/buscar?q=${encoded}`);
}

export function extractFromHTML(html) {
  return { data: parseCompanyFromDOM(html, ""), method: "cheerio" };
}

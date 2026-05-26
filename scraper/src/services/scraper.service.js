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

const TIMEOUT_MS = 30_000;
const MAX_RETRIES = 2;

// ─── Selectors that define "noise" — remove before extracting ─────────────────
const NOISE_SELECTORS = [
  "nav", "header", "footer", "aside",
  // Sections with related/other companies
  '[class*="relacionad"]', '[class*="similar"]', '[class*="otras-empresa"]',
  '[class*="otras empresa"]', '[class*="sugerencia"]', '[class*="recomend"]',
  '[id*="relacionad"]', '[id*="similar"]', '[id*="otras"]',
  // Generic noise
  '[class*="sidebar"]', '[class*="banner"]', '[class*="publicidad"]',
  '[class*="anuncio"]', '[class*="cookie"]', '[class*="popup"]',
  '[class*="modal"]', '[class*="newsletter"]', '[class*="suscri"]',
  ".breadcrumb", '[class*="breadcrumb"]',
  '[class*="pagination"]', '[class*="paginacion"]',
  // Scripts and media
  "script", "style", "noscript", "iframe", "img", "svg",
].join(", ");

// ─── Browser factory ────────────────────────────────────────────────────────────
async function launchBrowser() {
  const isDocker = process.env.DOCKER === "true" || process.env.NODE_ENV === "production";

  if (isDocker) {
    const chromium = (await import("@sparticuz/chromium")).default;
    const puppeteer = (await import("puppeteer-core")).default;
    return puppeteer.launch({
      args: [
        ...chromium.args,
        "--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas", "--no-first-run", "--no-zygote",
        "--single-process", "--disable-gpu",
      ],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });
  }

  const puppeteer = (await import("puppeteer-core")).default;
  const possiblePaths = [
    process.env.CHROME_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "/usr/bin/google-chrome", "/usr/bin/chromium-browser", "/usr/bin/chromium",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ].filter(Boolean);

  let executablePath = null;
  for (const p of possiblePaths) {
    try {
      const { existsSync } = await import("fs");
      if (existsSync(p)) { executablePath = p; break; }
    } catch { /* ignore */ }
  }

  if (!executablePath) {
    throw new Error("No se encontró Chrome. Configura CHROME_PATH en .env");
  }

  return puppeteer.launch({
    executablePath,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
    headless: true,
    ignoreHTTPSErrors: true,
  });
}

// ─── Fetch HTML with timeout ────────────────────────────────────────────────────
async function fetchHTML(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "es-CO,es;q=0.9,en;q=0.5",
      },
      redirect: "follow",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

// ─── Puppeteer fetch ────────────────────────────────────────────────────────────
async function fetchWithPuppeteer(url) {
  let browser = null;
  try {
    browser = await launchBrowser();
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      if (["image", "stylesheet", "font", "media"].includes(req.resourceType())) {
        req.abort();
      } else {
        req.continue();
      }
    });
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    );
    await page.setExtraHTTPHeaders({ "Accept-Language": "es-CO,es;q=0.9" });
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: TIMEOUT_MS });
    await new Promise((r) => setTimeout(r, 1500));
    return await page.content();
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}

// ─── Core DOM parser — extracts ONLY from the main company section ─────────────
function parseCompanyFromDOM(html, baseUrl) {
  const $ = cheerio.load(html);
  const result = buildEmpty();
  result.sourceUrl = baseUrl;

  // ── Step 1: JSON-LD structured data (most reliable source) ──────────────────
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const json = JSON.parse($(el).html() || "{}");
      const candidates = Array.isArray(json["@graph"]) ? json["@graph"] : [json];
      const org = candidates.find(
        (g) => g["@type"] === "Organization" || g["@type"] === "LocalBusiness" || g["@type"] === "Corporation"
      );
      if (!org) return;

      result.razonSocial ||= org.name?.trim() ?? null;
      result.website ||= org.url?.trim() ?? null;
      result.descripcion ||= org.description?.trim().slice(0, 400) ?? null;

      if (org.address) {
        result.direccion  ||= [org.address.streetAddress].filter(Boolean).join(", ") || null;
        result.ciudad     ||= org.address.addressLocality?.trim() ?? null;
        result.departamento ||= org.address.addressRegion?.trim() ?? null;
      }
      if (org.telephone) {
        const raw = Array.isArray(org.telephone) ? org.telephone : [org.telephone];
        raw.forEach((p) => {
          const c = cleanAndValidatePhone(String(p));
          if (c) (isMobilePhone(c) ? result.celulares : result.telefonos).push(c);
        });
      }
      if (org.email) {
        const raw = Array.isArray(org.email) ? org.email : [org.email];
        raw.filter(isValidEmail).forEach((e) => result.emails.push(e.toLowerCase()));
      }
      if (org.sameAs) {
        const links = Array.isArray(org.sameAs) ? org.sameAs : [org.sameAs];
        for (const link of links) {
          if (link.includes("linkedin.com/company") && !result.redesSociales.linkedin) result.redesSociales.linkedin = link;
          else if (link.includes("facebook.com") && !result.redesSociales.facebook) result.redesSociales.facebook = link;
          else if (link.includes("instagram.com") && !result.redesSociales.instagram) result.redesSociales.instagram = link;
          else if ((link.includes("twitter.com") || link.includes("x.com")) && !result.redesSociales.twitter) result.redesSociales.twitter = link;
        }
      }
    } catch { /* ignore malformed */ }
  });

  // ── Step 2: Meta tags ───────────────────────────────────────────────────────
  const ogTitle = $('meta[property="og:title"]').attr("content")?.trim();
  const ogDesc  = $('meta[property="og:description"]').attr("content")?.trim();
  const metaDesc = $('meta[name="description"]').attr("content")?.trim();
  result.descripcion ||= ogDesc || metaDesc || null;

  // ── Step 3: Remove noise from DOM before any further extraction ─────────────
  // Mark and SAVE the position of "related companies" sections, then cut them.
  // We detect them by their heading text.
  $("h2, h3, h4, section, div").each((_, el) => {
    const txt = $(el).text().trim().toLowerCase();
    if (
      txt.startsWith("empresa") && txt.includes("relacionad") ||
      txt.startsWith("otras empresa") ||
      txt.startsWith("también") ||
      txt.startsWith("más empresa") ||
      txt.startsWith("directorio") ||
      txt.startsWith("resultados de búsqueda") ||
      txt.startsWith("búsqueda")
    ) {
      // Remove this element and everything after it
      $(el).nextAll().remove();
      $(el).remove();
      return false; // stop .each
    }
  });

  // Remove standard noise selectors
  $(NOISE_SELECTORS).remove();

  // ── Step 4: Extract phones from tel: links (highest confidence) ─────────────
  $('a[href^="tel:"]').each((_, el) => {
    const raw = $(el).attr("href").replace(/^tel:/i, "").trim();
    const cleaned = cleanAndValidatePhone(raw);
    if (cleaned) {
      const arr = isMobilePhone(cleaned) ? result.celulares : result.telefonos;
      arr.push(cleaned);
    }
  });

  // ── Step 5: Extract emails from mailto: links (highest confidence) ──────────
  $('a[href^="mailto:"]').each((_, el) => {
    const raw = $(el).attr("href")
      .replace(/^mailto:/i, "")
      .split("?")[0]
      .trim()
      .toLowerCase();
    if (isValidEmail(raw)) result.emails.push(raw);
  });

  // ── Step 6: Extract company name from DOM ───────────────────────────────────
  if (!result.razonSocial) {
    // Try InformaColombia-style: look for the first significant heading
    // that looks like a company name (has legal suffix or is title-cased)
    const headings = ["h1", "h2", ".empresa-nombre", ".company-name", "[class*='empresa']", "[class*='razon-social']"];
    for (const sel of headings) {
      const el = $(sel).first();
      if (!el.length) continue;
      const txt = el.text().trim();
      if (!txt || txt.length > 120) continue;
      // Accept if it has a company legal suffix
      if (/S\.?A\.?S|LTDA|LIMITADA|E\.?U|S\.?A\.|CÍA|CIA\.|CORP|INC|GROUP/i.test(txt)) {
        result.razonSocial = txt;
        break;
      }
      // Accept if it looks like a proper name (Title Case, not a sentence)
      if (/^[A-ZÁÉÍÓÚÑ]/.test(txt) && txt.split(" ").length <= 8 && !/[?¿!¡]/.test(txt)) {
        result.razonSocial = txt;
        break;
      }
    }
    // Fallback: try og:title but strip site name (everything after " | " or " - ")
    if (!result.razonSocial && ogTitle) {
      const cleaned = ogTitle.split(/\s*[|\-–—]\s*/)[0].trim();
      if (cleaned.length > 2 && cleaned.length < 100) {
        result.razonSocial = cleaned;
      }
    }
  }

  // ── Step 7: Extract NIT from DOM ────────────────────────────────────────────
  if (!result.nit) {
    // Look for element with "nit" in class/id/label
    const nitEl = $('[class*="nit" i], [id*="nit" i], [data-label*="nit" i]').first();
    if (nitEl.length) {
      const txt = nitEl.text().trim();
      const m = txt.match(/\d{3}[.\s]?\d{3}[.\s]?\d{3}[-\s]?\d/);
      if (m) result.nit = normalizeNIT(m[0]);
    }
  }

  // ── Step 8: Extract address from DOM ────────────────────────────────────────
  if (!result.direccion) {
    const addrEl = $('address, [class*="direcci" i], [class*="address" i], [itemprop="address"]').first();
    if (addrEl.length) {
      const txt = addrEl.text().replace(/\s+/g, " ").trim();
      if (txt.length > 5 && txt.length < 300) result.direccion = txt;
    }
  }

  // ── Step 9: Extract representante legal ─────────────────────────────────────
  if (!result.representanteLegal) {
    const repEl = $('[class*="representante" i], [class*="legal" i], [class*="gerente" i]').first();
    if (repEl.length) {
      const txt = repEl.text().replace(/\s+/g, " ").trim();
      if (txt.length > 3 && txt.length < 100) result.representanteLegal = txt;
    }
  }

  // ── Step 10: Extract estado empresa ─────────────────────────────────────────
  if (!result.estadoEmpresa) {
    const estadoEl = $('[class*="estado" i], [class*="status" i], [class*="activa" i]').first();
    if (estadoEl.length) {
      const txt = estadoEl.text().trim();
      if (txt.length < 50) result.estadoEmpresa = txt;
    }
  }

  // ── Step 11: Social links from remaining HTML ───────────────────────────────
  const remainingHTML = $.html();
  const social = extractSocialLinks(remainingHTML);
  result.redesSociales.linkedin  ||= social.linkedin;
  result.redesSociales.facebook  ||= social.facebook;
  result.redesSociales.instagram ||= social.instagram;
  result.redesSociales.twitter   ||= social.twitter;
  result.redesSociales.youtube   ||= social.youtube;

  // ── Step 12: Clean text from remaining main content for fallback extraction ──
  const mainText = $("body").text().replace(/\s+/g, " ").trim();

  // Phones from text (fallback — only if not already found)
  if (result.telefonos.length === 0 && result.celulares.length === 0) {
    const textPhones = extractPhonesFromText(mainText);
    textPhones.forEach((p) => {
      (isMobilePhone(p) ? result.celulares : result.telefonos).push(p);
    });
  }

  // Emails from text (fallback — only if not already found)
  if (result.emails.length === 0) {
    const textEmails = extractEmailsFromText(mainText);
    result.emails.push(...textEmails);
  }

  // NIT from text (fallback)
  if (!result.nit) {
    result.nit = extractNIT(mainText);
  }

  // Company name from text (last resort)
  if (!result.razonSocial) {
    result.razonSocial = extractCompanyNameFromText(mainText) ?? "";
  }

  // Location from text
  result.departamento ||= detectDepartamento(mainText);
  result.ciudad       ||= result.departamento;
  result.industria    ||= extractIndustria(mainText);

  // ── Step 13: Website ────────────────────────────────────────────────────────
  if (!result.website) {
    // Look for explicit website links, excluding the current page's domain
    let baseHost = "";
    try { baseHost = new URL(baseUrl).hostname; } catch { /* baseUrl may be empty */ }
    $('a[href^="http"]').each((_, el) => {
      const href = $(el).attr("href");
      if (!href) return;
      try {
        const u = new URL(href);
        const socialDomains = ["facebook", "instagram", "linkedin", "twitter", "youtube", "google", "wa.me", "whatsapp"];
        if (
          u.hostname !== baseHost &&
          !socialDomains.some((s) => u.hostname.includes(s)) &&
          !result.website
        ) {
          result.website = href;
        }
      } catch { /* ignore */ }
    });
  }

  // ── Step 14: Keywords ────────────────────────────────────────────────────────
  result.keywords = extractKeywords(mainText);

  // ── Step 15: Deduplicate and clean ──────────────────────────────────────────
  result.telefonos = [...new Set(result.telefonos.filter(Boolean))];
  result.celulares = [...new Set(result.celulares.filter(Boolean))];
  result.emails    = [...new Set(result.emails.filter(Boolean).map((e) => e.toLowerCase()))];

  result.qualityScore = calculateQualityScore(result);

  return result;
}

function normalizeNIT(raw) {
  const digits = raw.replace(/[\s.]/g, "");
  const nums = digits.replace(/[^0-9]/g, "");
  if (nums.length >= 10) return `${nums.slice(0, 9)}-${nums.slice(9, 10)}`;
  if (nums.length === 9) return nums;
  return raw.trim();
}

function extractKeywords(text) {
  const stop = new Set([
    "de","la","el","en","y","a","con","del","los","las","un","una","es","se",
    "su","por","para","que","al","has","the","and","or","to","of","in","is",
    "it","be","as","at","so","we","he","by","do","no","if","up","an","on",
    "colombia","colombiana","colombiano","empresa","empresas","información",
    "contacto","teléfono","celular","dirección","ciudad","departamento",
  ]);

  const words = text.toLowerCase()
    .replace(/[^a-záéíóúñ\s]/gi, " ")
    .split(/\s+/)
    .filter((w) => w.length > 4 && !stop.has(w));

  const freq = {};
  for (const w of words) freq[w] = (freq[w] || 0) + 1;

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

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt === 0) {
        try {
          const html = await fetchHTML(urlStr);
          const data = parseCompanyFromDOM(html, urlStr);
          return { data, method: "fetch" };
        } catch (fetchErr) {
          console.log(`[scraper] fetch failed (${fetchErr.message}), trying puppeteer...`);
        }
      }
      const html = await fetchWithPuppeteer(urlStr);
      const data = parseCompanyFromDOM(html, urlStr);
      return { data, method: "puppeteer" };
    } catch (err) {
      lastError = err;
      console.error(`[scraper] attempt ${attempt + 1} failed:`, err.message);
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, 1200 * (attempt + 1)));
      }
    }
  }
  throw lastError ?? new Error("Scraping fallido después de varios intentos");
}

export async function scrapeByNameOrNIT(input, type) {
  const encoded = encodeURIComponent(input.trim());
  const searchUrl = `https://www.informacolombia.com/buscar?q=${encoded}`;
  return scrapeURL(searchUrl);
}

export function extractFromHTML(html) {
  const data = parseCompanyFromDOM(html, "");
  return { data, method: "cheerio" };
}

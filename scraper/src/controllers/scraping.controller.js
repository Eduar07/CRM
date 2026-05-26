import {
  scrapeURL,
  scrapeByNameOrNIT,
  extractFromHTML,
} from "../services/scraper.service.js";
import { extractWithAI } from "../services/ai.extraction.service.js";
import { validateInput, validateURL, validateContent } from "../utils/validators.js";

// POST /api/scrape
export async function scrape(req, res, next) {
  try {
    const { input, type = "auto" } = req.body;

    const validation = validateInput(input);
    if (!validation.valid) {
      return res.status(400).json({ success: false, error: validation.error });
    }

    const t0 = Date.now();
    let result;

    if (type === "url" || /^https?:\/\//i.test(input.trim())) {
      // URL scraping
      const urlValidation = validateURL(input.trim());
      if (!urlValidation.valid) {
        return res.status(400).json({ success: false, error: urlValidation.error });
      }
      result = await scrapeURL(input.trim());
    } else {
      // Name or NIT
      result = await scrapeByNameOrNIT(input.trim(), type);
    }

    const duration = Date.now() - t0;

    return res.json({
      success: true,
      data: result.data,
      method: result.method,
      duration,
    });
  } catch (err) {
    console.error("[scrape]", err.message);
    return res.status(500).json({
      success: false,
      error: err.message ?? "Error durante el scraping",
    });
  }
}

// POST /api/extract/html
export async function extractHTML(req, res, next) {
  try {
    const { html } = req.body;

    const validation = validateContent(html);
    if (!validation.valid) {
      return res.status(400).json({ success: false, error: validation.error });
    }

    const t0 = Date.now();
    const result = extractFromHTML(html);
    const duration = Date.now() - t0;

    return res.json({
      success: true,
      data: result.data,
      method: result.method,
      duration,
    });
  } catch (err) {
    console.error("[extractHTML]", err.message);
    return res.status(500).json({
      success: false,
      error: err.message ?? "Error al extraer datos del HTML",
    });
  }
}

// POST /api/extract/ai
export async function extractAI(req, res, next) {
  try {
    const { content } = req.body;

    const validation = validateContent(content);
    if (!validation.valid) {
      return res.status(400).json({ success: false, error: validation.error });
    }

    const t0 = Date.now();
    const data = await extractWithAI(content);
    const duration = Date.now() - t0;

    return res.json({
      success: true,
      data,
      method: "ai",
      duration,
    });
  } catch (err) {
    console.error("[extractAI]", err.message);
    return res.status(500).json({
      success: false,
      error: err.message ?? "Error al extraer datos con IA",
    });
  }
}

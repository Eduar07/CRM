import { Router } from "express";
import { scrape, extractHTML, extractAI } from "../controllers/scraping.controller.js";
import { scrapeLimiter, extractLimiter } from "../middlewares/rateLimiter.js";

const router = Router();

// Health check
router.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "campusland-scraper",
    timestamp: new Date().toISOString(),
  });
});

// Main scraping endpoint
router.post("/api/scrape", scrapeLimiter, scrape);

// HTML extraction (no puppeteer, just cheerio/regex)
router.post("/api/extract/html", extractLimiter, extractHTML);

// AI-powered extraction
router.post("/api/extract/ai", extractLimiter, extractAI);

export default router;

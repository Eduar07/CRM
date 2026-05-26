import rateLimit from "express-rate-limit";

export const scrapeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,             // max 10 scrape requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Demasiadas solicitudes. Espera 1 minuto antes de continuar.",
  },
});

export const extractLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Demasiadas solicitudes de extracción. Espera 1 minuto.",
  },
});

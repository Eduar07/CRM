import express from "express";
import helmet from "helmet";
import cors from "cors";
import scrapingRouter from "./routes/scraping.routes.js";
import { errorHandler, notFound, requestLogger } from "./middlewares/security.js";

const PORT = parseInt(process.env.PORT ?? "4000", 10);
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? "http://localhost:3000,http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

const app = express();

// Trust the Nginx reverse proxy so express-rate-limit reads the real client IP
// from X-Forwarded-For instead of throwing ERR_ERL_UNEXPECTED_X_FORWARDED_FOR
app.set("trust proxy", 1);

// ── Security middleware ────────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable for API
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, server-to-server)
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(requestLogger);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/", scrapingRouter);

// ── Error handling ────────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[scraper] Service running on port ${PORT}`);
  console.log(`[scraper] Environment: ${process.env.NODE_ENV ?? "development"}`);
  console.log(
    `[scraper] AI extraction: ${process.env.ANTHROPIC_API_KEY ? "enabled" : "disabled (no API key)"}`
  );
});

export default app;

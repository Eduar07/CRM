export function errorHandler(err, req, res, _next) {
  console.error("[scraper-error]", err.message ?? err);
  res.status(500).json({ success: false, error: "Error interno del servidor" });
}

export function notFound(req, res) {
  res.status(404).json({ success: false, error: `Ruta no encontrada: ${req.path}` });
}

export function requestLogger(req, _res, next) {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
}

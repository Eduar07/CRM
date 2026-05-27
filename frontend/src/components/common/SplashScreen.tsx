import { useState, useEffect } from "react";

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const [hiding, setHiding] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHiding(true);
      setTimeout(onDone, 680);
    }, 2100);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className={`splash-screen${hiding ? " splash-hide" : ""}`}>
      {/* Background blobs */}
      <div
        className="login-blob-1 absolute top-1/4 -left-24 h-80 w-80 rounded-full blur-3xl"
        style={{ backgroundColor: "rgba(99, 102, 241, 0.18)" }}
      />
      <div
        className="login-blob-2 absolute -bottom-16 right-1/4 h-72 w-72 rounded-full blur-3xl"
        style={{ backgroundColor: "rgba(139, 92, 246, 0.15)" }}
      />

      {/* Logo */}
      <div className="relative mb-6 animate-scale-in">
        <div
          className="animate-pulse-ring absolute inset-0 rounded-2xl"
          style={{ backgroundColor: "rgba(99, 102, 241, 0.35)" }}
        />
        <div
          className="animate-pulse-ring absolute inset-0 rounded-2xl delay-300"
          style={{ backgroundColor: "rgba(99, 102, 241, 0.18)" }}
        />
        <div
          className="relative flex h-20 w-20 items-center justify-center rounded-2xl shadow-2xl"
          style={{
            background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
            boxShadow: "0 25px 50px rgba(99, 102, 241, 0.4)",
          }}
        >
          <span className="text-3xl font-bold text-white">C</span>
        </div>
      </div>

      {/* Brand text */}
      <div className="mb-8 text-center animate-fade-in-up delay-150">
        <p className="text-2xl font-bold text-white tracking-tight">Campusland CRM</p>
        <p className="mt-1 text-sm" style={{ color: "rgba(165, 180, 252, 0.75)" }}>
          Iniciando sistema...
        </p>
      </div>

      {/* Progress bar */}
      <div
        className="w-48 overflow-hidden rounded-full animate-fade-in delay-250"
        style={{ height: "3px", backgroundColor: "rgba(99, 102, 241, 0.2)" }}
      >
        <div className="splash-progress" />
      </div>

      {/* Version */}
      <p
        className="absolute bottom-8 text-xs animate-fade-in delay-400"
        style={{ color: "rgba(255, 255, 255, 0.2)" }}
      >
        v1.0 · {new Date().getFullYear()}
      </p>
    </div>
  );
}

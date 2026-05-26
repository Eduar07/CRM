import Anthropic from "@anthropic-ai/sdk";
import { calculateQualityScore } from "../utils/data.extractor.js";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `Eres un extractor experto de información empresarial B2B colombiana.
Tu tarea es analizar texto o HTML y extraer información estructurada de empresas.
Devuelve ÚNICAMENTE un JSON válido con la siguiente estructura, sin texto adicional:

{
  "razonSocial": "string o null",
  "nombreComercial": "string o null",
  "nit": "string o null (formato: 123456789-1)",
  "telefonos": ["array de teléfonos fijos colombianos"],
  "celulares": ["array de celulares colombianos"],
  "emails": ["array de emails válidos"],
  "website": "string o null",
  "ciudad": "string o null",
  "departamento": "string o null",
  "direccion": "string o null",
  "actividadEconomica": "string o null (código CIIU o descripción)",
  "industria": "string o null (ej: Tecnología, Salud, Manufactura)",
  "empleados": "string o null (ej: '50-200' o '500')",
  "representanteLegal": "string o null",
  "estadoEmpresa": "string o null (ej: Activa, Liquidada)",
  "redesSociales": {
    "linkedin": "string o null",
    "facebook": "string o null",
    "instagram": "string o null",
    "twitter": "string o null",
    "youtube": "string o null"
  },
  "descripcion": "string o null (máx 300 caracteres)",
  "keywords": ["array de palabras clave relevantes, máx 10"]
}

Reglas:
- Extrae SOLO información que esté explícitamente en el texto
- Para teléfonos colombianos: fijos tienen 7 dígitos (con indicativo son 10), celulares inician con 3 y tienen 10 dígitos
- Normaliza NITs al formato 123456789-1
- Si no encuentras un campo, usa null (no inventes información)
- Elimina duplicados
- Para industria, usa una de: Tecnología, Educación, Salud, Construcción, Manufactura, Comercio, Agroindustria, Logística, Servicios Financieros, Energía, Otro`;

export async function extractWithAI(content) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY no configurada. Agrega la variable de entorno para usar extracción con IA."
    );
  }

  // Truncate to avoid excessive token usage (Haiku has context limits)
  const truncated = content.slice(0, 50_000);

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Extrae la información empresarial de este contenido:\n\n${truncated}`,
      },
    ],
  });

  const rawText = message.content[0]?.type === "text" ? message.content[0].text : "";

  // Parse JSON from response
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("La IA no devolvió JSON válido");
  }

  const data = JSON.parse(jsonMatch[0]);

  // Ensure arrays exist
  data.telefonos = data.telefonos ?? [];
  data.celulares = data.celulares ?? [];
  data.emails = data.emails ?? [];
  data.keywords = data.keywords ?? [];
  data.redesSociales = data.redesSociales ?? {};

  data.qualityScore = calculateQualityScore(data);

  return data;
}

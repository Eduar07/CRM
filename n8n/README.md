# N8N — Workflow de Prospección Automática Campusland

## 📌 Qué hace

Automatiza la búsqueda semanal de empresas objetivo en Colombia (Santander + Norte de Santander), enriquece contactos con Apollo.io, los ingesta al CRM y envía emails personalizados SOLO a contactos con emails personales (no genéricos).

## 🎯 Lógica del negocio reflejada

1. **Trigger**: lunes 8am (cron) o manual vía webhook
2. **Apollo.io** busca empresas medianas-grandes en los departamentos objetivo
3. **Filtro**: solo Colombia, con nombre y LinkedIn
4. **Switch**: rutea cada empresa a su vendedora según departamento
   - Norte de Santander → `karolain`
   - Santander → `marcela`
5. **Apollo.io**: enriquecimiento con CEO / CTO / Talent Manager / HR
6. **Clasificación del email**:
   - `info@`, `contact@`, `sales@`, etc. → genérico (NO enviar auto)
   - `nombre.apellido@` → personal (SÍ enviar auto)
7. **Ingesta al CRM** vía `POST /api/automation/ingest`
8. **Si email personal** → `POST /api/emails/prospection` (usa el cooldown de 7 días del backend)
9. **Retry** 3 intentos con 5s entre cada uno (resiliente a fallos de red)

## 🚀 Cómo importar en N8N

1. Abrir N8N (local o en la nube)
2. Menú: `Workflows → Import from file`
3. Seleccionar `workflow_prospecting.json`
4. Configurar las credenciales necesarias (abajo)
5. Activar el workflow

## 🔑 Variables de entorno / Credenciales

En N8N, ve a `Settings → Variables` (o `.env`) y define:

| Variable | Descripción | Ejemplo |
|---|---|---|
| `APOLLO_API_KEY` | API key de Apollo.io | `abc123xyz...` |
| `CAMPUSLAND_AUTOMATION_TOKEN` | Token compartido con el backend para endpoint `/automation/*` | `campusland-secret-2026` |

En el backend, configura el mismo token en `application.properties`:
```properties
campusland.automation.token=campusland-secret-2026
```

## 🌐 URL del CRM desde N8N

- Si N8N corre en Docker y el CRM también: `http://host.docker.internal:8080/api`
- Si N8N corre local y el CRM también: `http://localhost:8080/api`
- Si N8N está en la nube y el CRM en tu máquina: necesitas un túnel (ngrok, cloudflared, etc.)

## 📝 Endpoints que usa el workflow

| Endpoint | Método | Propósito |
|---|---|---|
| `/api/automation/ingest` | POST | Crear empresa + contacto + asignar vendedor (dedupe por LinkedIn) |
| `/api/emails/prospection` | POST | Enviar email de prospección al contacto primario |

## 🧪 Probar manualmente

Con N8N corriendo, hacer POST al webhook:
```bash
curl -X POST http://localhost:5678/webhook/campusland-manual-prospect \
  -H "Content-Type: application/json" \
  -d '{}'
```

## ⚠️ Notas importantes

1. **Apollo.io cobra por búsqueda** — el workflow pide 25 empresas + hasta 5 contactos cada una = ~125 llamadas por ejecución. Revisa tu plan.
2. El `cooldown de 7 días` del backend previene spam si el workflow se ejecuta 2 veces en la misma semana: los contactos ya contactados serán rechazados con 409 (registrado en el log de N8N, no rompe el flujo).
3. El workflow NO actualiza empresas existentes. El dedupe se hace por `linkedinUrl` en el endpoint `/automation/ingest` del backend.
4. Los contactos con email genérico **se guardan en el CRM pero no reciben email automático** — la vendedora deberá llamar o buscar otro contacto.

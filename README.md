# Campusland CRM — Guía de despliegue con Docker

## Requisitos previos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y corriendo
- Git (para clonar el repositorio)
- Puerto **3000**, **4000**, **8080** y **3307** libres en la máquina

---

## 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd CRM
```

---

## 2. Crear el archivo de variables de entorno

Copia el archivo de ejemplo y edítalo con tus valores reales:

```bash
# En Windows (PowerShell)
copy .env.example .env

# En Mac / Linux
cp .env.example .env
```

Si no existe `.env.example`, crea un archivo `.env` en la raíz con este contenido:

```env
# Base de datos
MYSQL_DATABASE=campusland_crm
MYSQL_USER=crm_user
MYSQL_PASSWORD=crm_password
MYSQL_ROOT_PASSWORD=root_password

# JWT — cambia esto en producción por una clave segura de mínimo 32 caracteres
JWT_SECRET=campusland-crm-super-secret-key-2024-production-ready-minimum-256bits

# APIs externas (dejar como están si no se usan)
LINKEDIN_API_KEY=dev-linkedin-api-key
APOLLO_API_KEY=dev-apollo-api-key
HUNTER_API_KEY=dev-hunter-api-key
EMAIL_API_KEY=dev-email-api-key

# Microsoft (dejar como están si no se usa integración con Outlook)
MICROSOFT_ACCESS_TOKEN=dev-microsoft-access-token
MICROSOFT_CLIENT_ID=dev-client-id
MICROSOFT_CLIENT_SECRET=dev-client-secret
MICROSOFT_REDIRECT_URI=http://localhost:8080/api/auth/microsoft/callback

# Opcional: habilita extracción con IA en el módulo Scraping
# ANTHROPIC_API_KEY=sk-ant-...
```

---

## 3. Construir y levantar todos los servicios

```bash
docker compose up --build -d
```

Esto construye las imágenes y levanta los 4 contenedores en segundo plano:

| Contenedor | Puerto | Descripción |
|---|---|---|
| `campusland-frontend` | 3000 | Aplicación React (Nginx) |
| `campusland-backend` | 8080 | API Spring Boot (Java) |
| `campusland-scraper` | 4000 | Microservicio de scraping (Node.js) |
| `campusland-mysql` | 3307 | Base de datos MySQL |

> La primera vez puede tardar **5–10 minutos** porque descarga imágenes base y compila el backend Java con Maven.

---

## 4. Verificar que todo está corriendo

```bash
docker compose ps
```

Todos los contenedores deben mostrar `Up` o `Up (healthy)`.

---

## 5. Abrir la aplicación

Abre el navegador en:

```
http://localhost:3000
```

---

## Comandos útiles del día a día

```bash
# Ver logs de todos los servicios en tiempo real
docker compose logs -f

# Ver logs de un servicio específico
docker compose logs -f frontend
docker compose logs -f backend
docker compose logs -f scraper

# Detener todos los contenedores (sin borrar datos)
docker compose stop

# Volver a levantar después de detener
docker compose start

# Detener y eliminar contenedores (los datos de MySQL se conservan en el volumen)
docker compose down

# Eliminar TODO incluyendo la base de datos (¡cuidado, borra los datos!)
docker compose down -v
```

---

## Reconstruir un servicio específico tras cambios en el código

```bash
# Solo el frontend
docker compose build frontend && docker compose up -d --no-deps frontend

# Solo el backend
docker compose build backend && docker compose up -d --no-deps backend

# Solo el scraper
docker compose build scraper && docker compose up -d --no-deps scraper
```

---

## Solución de problemas comunes

**Los contenedores no levantan / error al conectar con la base de datos**
```bash
# Espera 30 segundos y vuelve a revisar — MySQL tarda en iniciar la primera vez
docker compose ps
docker compose logs mysql
```

**Puerto ocupado (error "address already in use")**
```bash
# Cambia el puerto externo en docker-compose.yml
# Ejemplo: cambiar "3000:80" a "3001:80" para el frontend
```

**Reconstruir desde cero (imágenes limpias)**
```bash
docker compose down
docker compose build --no-cache
docker compose up -d
```

---

## N8N — Workflow de prospección automática

El proyecto incluye un workflow de N8N en la carpeta `n8n/` que automatiza la búsqueda semanal de empresas en Colombia, enriquece contactos con Apollo.io, los ingesta al CRM y envía emails personalizados.

### Qué hace el workflow

1. Se dispara los lunes a las 8am (o manualmente vía webhook)
2. Apollo.io busca empresas medianas-grandes en Santander y Norte de Santander
3. Filtra solo empresas con nombre y LinkedIn
4. Asigna cada empresa a la vendedora según departamento:
   - Norte de Santander → `karolain`
   - Santander → `marcela`
5. Enriquece con contactos: CEO, CTO, Talent Manager, HR
6. Clasifica el email del contacto:
   - `info@`, `contact@`, `sales@`, etc. → genérico, NO envía email automático
   - `nombre.apellido@` → personal, SÍ envía email automático
7. Ingesta la empresa al CRM via `POST /api/automation/ingest`
8. Si el email es personal, envía prospección via `POST /api/emails/prospection`
9. Reintenta 3 veces con 5 segundos entre intentos si hay fallo de red

### Cómo importar el workflow en N8N

```
1. Abrir N8N (local o en la nube)
2. Menú: Workflows → Import from file
3. Seleccionar el archivo: n8n/workflow_prospecting.json
4. Configurar las credenciales (ver tabla abajo)
5. Activar el workflow
```

### Variables requeridas en N8N

En N8N ve a `Settings → Variables` y define:

| Variable | Descripción |
|---|---|
| `APOLLO_API_KEY` | API key de Apollo.io |
| `CAMPUSLAND_AUTOMATION_TOKEN` | Token compartido con el backend (debe coincidir con `application.properties`) |

En el backend, el mismo token debe estar en `application.properties`:
```properties
campusland.automation.token=campusland-secret-2026
```

### URL del CRM desde N8N

| Escenario | URL a usar |
|---|---|
| N8N en Docker + CRM en Docker | `http://host.docker.internal:8080/api` |
| N8N local + CRM local | `http://localhost:8080/api` |
| N8N en la nube + CRM en tu máquina | Requiere túnel (ngrok, cloudflared, etc.) |

### Endpoints que usa el workflow

| Endpoint | Método | Propósito |
|---|---|---|
| `/api/automation/ingest` | POST | Crea empresa + contacto + asigna vendedora (dedupe por LinkedIn) |
| `/api/emails/prospection` | POST | Envía email de prospección al contacto primario |

### Probar el workflow manualmente

```bash
curl -X POST http://localhost:5678/webhook/campusland-manual-prospect \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Notas importantes

- Apollo.io cobra por búsqueda. El workflow hace ~125 llamadas por ejecución (25 empresas x 5 contactos). Revisa tu plan.
- El backend tiene un cooldown de 7 días: si el workflow corre dos veces en la misma semana, los contactos ya contactados se rechazan con 409 pero el flujo no se rompe, queda registrado en los logs de N8N.
- El workflow no actualiza empresas existentes. El dedupe se hace por `linkedinUrl` en `/api/automation/ingest`.
- Los contactos con email genérico se guardan en el CRM pero no reciben email automático. La vendedora debe contactarlos manualmente.

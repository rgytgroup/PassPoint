import { config } from 'dotenv';
import { resolve } from 'node:path';

// Carga el .env de content-factory (GEMINI_API_KEY) y reutiliza el
// DATABASE_URL de la API. dotenv no sobrescribe lo ya definido, así que el
// orden mantiene un único sitio para cada variable.
config();
config({ path: resolve(process.cwd(), '..', 'apps', 'api', '.env') });

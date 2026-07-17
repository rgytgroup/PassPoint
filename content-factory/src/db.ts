import { config } from 'dotenv';
import { resolve } from 'node:path';
import { PrismaClient } from '@prisma/client';

// Carga primero el .env de content-factory (GEMINI_API_KEY, etc.) y luego
// reutiliza el DATABASE_URL de la API (dotenv no sobrescribe lo ya definido),
// así la URL de la base de datos vive en un solo sitio.
config();
config({ path: resolve(process.cwd(), '..', 'apps', 'api', '.env') });

export const prisma = new PrismaClient();

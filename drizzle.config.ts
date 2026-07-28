// Arquivo: drizzle.config.ts
import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Carrega as variáveis do arquivo .env.local
dotenv.config({ path: '.env.local' });

if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
  throw new Error("Variáveis do Turso ausentes no .env.local");
}

export default defineConfig({
  schema: './db/schema.ts',
  out: './drizzle',
  dialect: 'turso', // O dialeto correto e nativo para o Turso BD
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
});
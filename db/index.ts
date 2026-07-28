// Arquivo: src/db/index.ts
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

// Validação de segurança: Impede o sistema de iniciar sem as credenciais do banco
if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
  throw new Error("Faltam as variáveis de ambiente TURSO_DATABASE_URL ou TURSO_AUTH_TOKEN");
}

// Criação do cliente de conexão com o Turso
const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Exporta o banco de dados tipado pelo Drizzle ORM
export const db = drizzle(client, { schema });
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import fs from "fs";
import path from "path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const defaultDbPath = path.join(process.cwd(), "prisma", "dev.db");
const dbUrl = process.env.DATABASE_URL ?? `file:${defaultDbPath}`;

let adapter: PrismaBetterSqlite3 | undefined;
let isDbAvailable = false;

if (dbUrl.startsWith("file:")) {
  const localPath = dbUrl.replace("file:", "");
  isDbAvailable = fs.existsSync(localPath);
  if (isDbAvailable) {
    try {
      adapter = new PrismaBetterSqlite3({ url: dbUrl });
    } catch (error) {
      console.warn("[prisma] SQLite adapter init failed", error);
      adapter = undefined;
      isDbAvailable = false;
    }
  } else {
    console.warn(`[prisma] SQLite file not found: ${localPath}. Skipping DB initialization.`);
  }
}

const getClient = () => {
  try {
    if (!isDbAvailable) {
      // Fallback client (no-op) para evitar crash quando não há DB
      return new Proxy({} as any, {
        get(target, prop) {
          if (prop === "$connect" || prop === "$disconnect" || prop === "$on") {
            return async () => undefined;
          }
          return () => Promise.resolve([]);
        },
      }) as unknown as PrismaClient;
    }

    return new PrismaClient({
      adapter,
    });
  } catch (error) {
    console.error("[prisma] failed to create PrismaClient", error);
    return new Proxy({} as any, {
      get(target, prop) {
        if (prop === "$connect" || prop === "$disconnect" || prop === "$on") {
          return async () => undefined;
        }
        return () => Promise.resolve([]);
      },
    }) as unknown as PrismaClient;
  }
};

export const prisma = globalForPrisma.prisma ?? getClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;


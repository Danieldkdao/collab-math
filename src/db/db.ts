import { envServer } from "@/data/env/server";
import * as schema from "@/db/schema";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const pool = new Pool({
  connectionString: envServer.DATABASE_URL,
});

export const db = drizzle({ client: pool, schema });

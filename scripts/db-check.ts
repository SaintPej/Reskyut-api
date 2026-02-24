import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { sql } from "drizzle-orm";
import * as schema from "../src/lib/schema.js";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

async function check() {
  try {
    const userCols = await db.execute(
      sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'user' ORDER BY ordinal_position`
    );
    console.log("=== USER TABLE COLUMNS ===");
    for (const col of userCols.rows) {
      console.log(`  ${col.column_name}: ${col.data_type}`);
    }

    const accountCols = await db.execute(
      sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'account' ORDER BY ordinal_position`
    );
    console.log("\n=== ACCOUNT TABLE COLUMNS ===");
    for (const col of accountCols.rows) {
      console.log(`  ${col.column_name}: ${col.data_type}`);
    }

    const sessionCols = await db.execute(
      sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'session' ORDER BY ordinal_position`
    );
    console.log("\n=== SESSION TABLE COLUMNS ===");
    for (const col of sessionCols.rows) {
      console.log(`  ${col.column_name}: ${col.data_type}`);
    }

    const accounts = await db.select().from(schema.account).limit(5);
    console.log("\n=== EXISTING ACCOUNTS ===");
    console.log(JSON.stringify(accounts, null, 2));

    const sessions = await db.select().from(schema.session).limit(5);
    console.log("\n=== EXISTING SESSIONS ===");
    console.log(JSON.stringify(sessions, null, 2));

    const users = await db.select().from(schema.user).limit(5);
    console.log("\n=== EXISTING USERS ===");
    console.log(JSON.stringify(users, null, 2));
  } catch (e) {
    console.error("ERROR:", e);
  } finally {
    await pool.end();
  }
}

check();

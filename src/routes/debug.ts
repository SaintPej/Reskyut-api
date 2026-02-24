import { Router, Request, Response } from "express";
import db from "../lib/db.js";
import { user, account, session } from "../lib/schema.js";
import { sql } from "drizzle-orm";

const router = Router();

router.get("/users", async (_req: Request, res: Response) => {
  try {
    const users = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      })
      .from(user)
      .limit(10);
    res.json({ users });
  } catch (err) {
    console.error("Debug error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/accounts", async (_req: Request, res: Response) => {
  try {
    const accounts = await db
      .select({
        id: account.id,
        accountId: account.accountId,
        providerId: account.providerId,
        userId: account.userId,
        scope: account.scope,
        createdAt: account.createdAt,
      })
      .from(account)
      .limit(10);
    res.json({ accounts });
  } catch (err: any) {
    console.error("Debug accounts error:", err);
    res.status(500).json({ error: err.message, code: err.code });
  }
});

router.get("/sessions", async (_req: Request, res: Response) => {
  try {
    const sessions = await db
      .select({
        id: session.id,
        userId: session.userId,
        expiresAt: session.expiresAt,
        createdAt: session.createdAt,
      })
      .from(session)
      .limit(10);
    res.json({ sessions });
  } catch (err: any) {
    console.error("Debug sessions error:", err);
    res.status(500).json({ error: err.message, code: err.code });
  }
});

router.get("/schema-test", async (_req: Request, res: Response) => {
  try {
    const userColumns = await db.execute(
      sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'user' ORDER BY ordinal_position`
    );
    const accountColumns = await db.execute(
      sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'account' ORDER BY ordinal_position`
    );
    const sessionColumns = await db.execute(
      sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'session' ORDER BY ordinal_position`
    );

    res.json({
      userColumns: userColumns.rows,
      accountColumns: accountColumns.rows,
      sessionColumns: sessionColumns.rows,
    });
  } catch (err: any) {
    console.error("Schema test error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;

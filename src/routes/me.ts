import { Router, Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../auth.js";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    res.json({
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        emailVerified: session.user.emailVerified,
      },
    });
  } catch (err) {
    console.error("Get session error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

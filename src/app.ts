import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth.js";
import healthRouter from "./routes/health.js";
import meRouter from "./routes/me.js";
import debugRouter from "./routes/debug.js";
import adoptionApplicationsRouter from "./routes/adoption-applications.js";

const app = express();

// Trust proxy headers (required for Vercel / reverse proxy deployments)
// Without this, Express sees http:// instead of https://, which breaks
// OAuth callback URL generation in better-auth
app.set("trust proxy", 1);

app.use(
  cors({
    origin: true, // Reflects the request origin — fixes invalid "*" + credentials combo
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Root route — prevents "Cannot GET /" when OAuth redirect falls through
app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// Mount better-auth handler BEFORE express.json()
// better-auth handles its own body parsing
// Wrap in error handler so Vercel doesn't swallow errors silently
const authHandler = toNodeHandler(auth);
const wrappedAuthHandler: express.RequestHandler = async (req, res, next) => {
  try {
    await authHandler(req, res);
  } catch (error) {
    console.error("Auth handler error:", error);
    if (!res.headersSent) {
      res.status(500).json({
        error: "Internal auth error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
};
app.all("/api/auth/*", wrappedAuthHandler);
app.all("/api/auth", wrappedAuthHandler);

app.use(express.json());

app.use("/health", healthRouter);
app.use("/me", meRouter);
app.use("/debug", debugRouter);
app.use("/adoption-applications", adoptionApplicationsRouter);

export default app;

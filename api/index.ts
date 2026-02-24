import "dotenv/config";
import app from "../src/app.js";

// Increase function timeout for auth operations (bcrypt hashing + DB writes)
export const config = {
  maxDuration: 30,
};

export default app;

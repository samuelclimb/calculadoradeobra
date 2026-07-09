import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const adminPasswordHash = process.env["ADMIN_PASSWORD_HASH"];
const adminPassword = process.env["ADMIN_PASSWORD"];

if (!adminPasswordHash && (!adminPassword || adminPassword.length < 8)) {
  throw new Error(
    "ADMIN_PASSWORD_HASH is required. As a temporary fallback, ADMIN_PASSWORD must be at least 8 characters.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});

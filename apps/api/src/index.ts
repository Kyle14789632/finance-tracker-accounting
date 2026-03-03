import { env } from "./config/env";
import { createServer } from "./app/create-server";
import { logger } from "./core/logging/logger";

const port = env.apiPort;
const app = createServer();

app.listen(port, () => {
  logger.info({ port, databaseConfigured: Boolean(env.databaseUrl) }, "API server listening");
});

import { env } from "./config/env";
import { createServer } from "./server";
import { logger } from "./utils/logger";

const port = env.apiPort;
const app = createServer();

app.listen(port, () => {
  logger.info(
    { port, databaseConfigured: Boolean(env.databaseUrl) },
    "API server listening"
  );
});

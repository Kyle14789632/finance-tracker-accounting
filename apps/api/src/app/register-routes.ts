import { Router } from "express";
import { accountsRouter } from "../modules/accounts";
import { authRouter } from "../modules/auth";
import { categoriesRouter } from "../modules/categories";
import { healthRouter } from "../modules/health";
import { meRouter } from "../modules/me";
import { reportsRouter } from "../modules/reports";
import { transactionsRouter } from "../modules/transactions";
import { authRateLimit } from "../middleware/auth-rate-limit";

export const registerRoutes = (): Router => {
  const router = Router();

  router.use("/health", healthRouter);
  router.use("/auth", authRateLimit, authRouter);
  router.use("/me", meRouter);
  router.use("/categories", categoriesRouter);
  router.use("/accounts", accountsRouter);
  router.use("/transactions", transactionsRouter);
  router.use("/reports", reportsRouter);

  return router;
};

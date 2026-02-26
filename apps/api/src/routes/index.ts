import { Router } from "express";
import { authRateLimit } from "../middleware/auth-rate-limit";
import accountsRouter from "./accounts";
import authRouter from "./auth";
import categoriesRouter from "./categories";
import healthRouter from "./health";
import meRouter from "./me";
import reportsRouter from "./reports";
import transactionsRouter from "./transactions";

const router = Router();

router.use("/health", healthRouter);
router.use("/auth", authRateLimit, authRouter);
router.use("/me", meRouter);
router.use("/categories", categoriesRouter);
router.use("/accounts", accountsRouter);
router.use("/transactions", transactionsRouter);
router.use("/reports", reportsRouter);

export default router;

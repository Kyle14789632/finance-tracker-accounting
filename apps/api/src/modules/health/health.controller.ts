import type { RequestHandler } from "express";

export const getHealthController: RequestHandler = (_req, res) => {
  res.status(200).json({ status: "ok" });
};

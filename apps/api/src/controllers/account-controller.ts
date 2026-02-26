import type { RequestHandler } from "express";
import {
  accountParamsSchema,
  createAccountRequestSchema,
  listAccountsQuerySchema,
  updateAccountRequestSchema
} from "@sft/shared";
import type { AuthLocals } from "../middleware/require-auth";
import { accountService } from "../services/account-service";

export const listAccountsController: RequestHandler<
  unknown,
  unknown,
  unknown,
  unknown,
  AuthLocals
> = async (req, res, next) => {
  try {
    const query = listAccountsQuerySchema.parse(req.query);
    const accounts = await accountService.listAccounts(res.locals.auth.userId, query);
    res.status(200).json({ accounts });
  } catch (error) {
    next(error);
  }
};

export const createAccountController: RequestHandler<
  unknown,
  unknown,
  unknown,
  unknown,
  AuthLocals
> = async (req, res, next) => {
  try {
    const payload = createAccountRequestSchema.parse(req.body);
    const account = await accountService.createAccount(res.locals.auth.userId, payload);
    res.status(201).json({ account });
  } catch (error) {
    next(error);
  }
};

export const updateAccountController: RequestHandler<
  unknown,
  unknown,
  unknown,
  unknown,
  AuthLocals
> = async (req, res, next) => {
  try {
    const { id } = accountParamsSchema.parse(req.params);
    const payload = updateAccountRequestSchema.parse(req.body);
    const account = await accountService.updateAccount(res.locals.auth.userId, id, payload);
    res.status(200).json({ account });
  } catch (error) {
    next(error);
  }
};

export const archiveAccountController: RequestHandler<
  unknown,
  unknown,
  unknown,
  unknown,
  AuthLocals
> = async (req, res, next) => {
  try {
    const { id } = accountParamsSchema.parse(req.params);
    const account = await accountService.archiveAccount(res.locals.auth.userId, id);
    res.status(200).json({ account });
  } catch (error) {
    next(error);
  }
};

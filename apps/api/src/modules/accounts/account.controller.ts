import {
  accountParamsSchema,
  createAccountRequestSchema,
  listAccountsQuerySchema,
  updateAccountRequestSchema,
} from "@sft/shared";
import { getRequestContext } from "../../core/http/auth-context";
import { asyncHandler } from "../../core/http/async-handler";
import { accountService } from "./account.service";

export const listAccountsController = asyncHandler(async (req, res) => {
  const query = listAccountsQuerySchema.parse(req.query);
  const context = getRequestContext(res);
  const accounts = await accountService.listAccounts(context.userId, query);
  res.status(200).json({ accounts });
});

export const createAccountController = asyncHandler(async (req, res) => {
  const payload = createAccountRequestSchema.parse(req.body);
  const context = getRequestContext(res);
  const account = await accountService.createAccount(context.userId, payload);
  res.status(201).json({ account });
});

export const updateAccountController = asyncHandler(async (req, res) => {
  const { id } = accountParamsSchema.parse(req.params);
  const payload = updateAccountRequestSchema.parse(req.body);
  const context = getRequestContext(res);
  const account = await accountService.updateAccount(context.userId, id, payload);
  res.status(200).json({ account });
});

export const archiveAccountController = asyncHandler(async (req, res) => {
  const { id } = accountParamsSchema.parse(req.params);
  const context = getRequestContext(res);
  const account = await accountService.archiveAccount(context.userId, id);
  res.status(200).json({ account });
});

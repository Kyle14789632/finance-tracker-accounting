import type { Response } from "express";

export type AuthLocals = {
  auth: {
    userId: string;
    email: string;
  };
};

export type RequestContext = {
  userId: string;
  email: string;
  requestId?: string;
};

export const getRequestContext = (res: Response): RequestContext => {
  const request = res.req as { id?: string };
  const locals = res.locals as AuthLocals;

  return {
    userId: locals.auth.userId,
    email: locals.auth.email,
    requestId: request.id,
  };
};

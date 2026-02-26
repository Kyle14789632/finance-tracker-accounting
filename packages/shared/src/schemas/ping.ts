import { z } from "zod";

export const pingSchema = z.object({
  message: z.string()
});

export type PingPayload = z.infer<typeof pingSchema>;

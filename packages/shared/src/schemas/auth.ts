import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Email must be valid");

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters");

const optionalNameSchema = z
  .string()
  .trim()
  .min(1, "Name cannot be empty")
  .max(100, "Name must be at most 100 characters")
  .optional();

const currencySchema = z
  .string()
  .trim()
  .regex(/^[A-Za-z]{3}$/, "Currency must be a 3-letter code")
  .transform((value) => value.toUpperCase());

export const registerRequestSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    name: optionalNameSchema,
    currency: currencySchema.optional()
  })
  .strict();

export const loginRequestSchema = z
  .object({
    email: emailSchema,
    password: z.string().min(1, "Password is required")
  })
  .strict();

export const publicUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().nullable(),
  currency: z.string().regex(/^[A-Z]{3}$/),
  learningModeEnabled: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const authSuccessResponseSchema = z.object({
  user: publicUserSchema,
  accessToken: z.string().min(1)
});

export const meResponseSchema = z.object({
  user: publicUserSchema
});

export const updateMeSettingsRequestSchema = z
  .object({
    learningModeEnabled: z.boolean()
  })
  .strict();

export const updateMeSettingsResponseSchema = z.object({
  user: publicUserSchema
});

export type RegisterRequest = z.infer<typeof registerRequestSchema>;
export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type PublicUser = z.infer<typeof publicUserSchema>;
export type AuthSuccessResponse = z.infer<typeof authSuccessResponseSchema>;
export type MeResponse = z.infer<typeof meResponseSchema>;
export type UpdateMeSettingsRequest = z.infer<typeof updateMeSettingsRequestSchema>;
export type UpdateMeSettingsResponse = z.infer<typeof updateMeSettingsResponseSchema>;

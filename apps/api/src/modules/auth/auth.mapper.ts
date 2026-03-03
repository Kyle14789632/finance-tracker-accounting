import type { User } from "../../../prisma/generated/client";
import type { PublicUser } from "@sft/shared";

const toSupportedCurrency = (currency: string): PublicUser["currency"] =>
  currency === "USD" ? "USD" : "PHP";

export const toPublicUser = (user: User): PublicUser => ({
  id: user.id,
  email: user.email,
  name: user.name,
  currency: toSupportedCurrency(user.currency),
  learningModeEnabled: user.learningModeEnabled,
  createdAt: user.createdAt.toISOString(),
  updatedAt: user.updatedAt.toISOString(),
});

export type AppNavItem = {
  label: string;
  path: string;
};

export const appNavItems: AppNavItem[] = [
  { label: "Dashboard", path: "/app/dashboard" },
  { label: "Transactions", path: "/app/transactions" },
  { label: "Accounts", path: "/app/accounts" },
  { label: "Categories", path: "/app/categories" },
  { label: "Statements", path: "/app/statements" },
  { label: "Settings", path: "/app/settings" }
];

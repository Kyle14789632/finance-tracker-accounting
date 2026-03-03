import { Prisma, PrismaClient } from "./generated/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

const DEMO_USER = {
  email: "demo@flowledger.dev",
  password: "DemoPass123!",
  name: "Demo User",
  currency: "PHP",
  learningModeEnabled: false,
} as const;

const DEMO_ACCOUNTS = [
  {
    id: "7f08d17a-26af-4f62-bf7d-e5804f65c18b",
    name: "Cash Wallet",
    type: "CASH",
  },
  {
    id: "1b921475-964f-45ec-8bf3-9d125a17f2e4",
    name: "Main Checking",
    type: "BANK",
  },
  {
    id: "8deec95e-65a8-49f3-981e-d214e8f7ec95",
    name: "Savings Goal",
    type: "SAVINGS",
  },
] as const;

const DEMO_CATEGORIES = [
  {
    id: "6855c0e9-d3ad-4100-99ef-e4efb5f7f5f2",
    name: "Salary",
    type: "INCOME",
  },
  {
    id: "8a419f44-6a55-42cb-a9e1-8db46f1d4fb5",
    name: "Part-time Work",
    type: "INCOME",
  },
  {
    id: "ed66902f-b144-49d6-bbc4-ef8f0dca7e2a",
    name: "Freelance",
    type: "INCOME",
  },
  {
    id: "ace91e96-825e-4c5b-ba96-a98592ccb84f",
    name: "Rent",
    type: "EXPENSE",
  },
  {
    id: "5cff2d77-6f9e-4d44-866b-fcae6ce09592",
    name: "Groceries",
    type: "EXPENSE",
  },
  {
    id: "aa635379-9d19-437f-a53f-cf94d38b99aa",
    name: "Transport",
    type: "EXPENSE",
  },
  {
    id: "97309f85-38df-4e39-bb4c-933b2fc0f897",
    name: "Utilities",
    type: "EXPENSE",
  },
  {
    id: "821ee719-c91f-454d-9072-9f2ff1cc95d2",
    name: "Education",
    type: "EXPENSE",
  },
] as const;

type DemoAccount = (typeof DEMO_ACCOUNTS)[number];
type DemoCategory = (typeof DEMO_CATEGORIES)[number];

type SeedTransaction = {
  accountId: string;
  categoryId: string;
  type: "INCOME" | "EXPENSE";
  amount: string;
  occurredAt: Date;
  note: string;
};

type SeedSummary = {
  accounts: number;
  categories: number;
  transactions: number;
  journalEntries: number;
};

const accountById = new Map<string, DemoAccount>(
  DEMO_ACCOUNTS.map((account) => [account.id, account] as const),
);
const categoryById = new Map<string, DemoCategory>(
  DEMO_CATEGORIES.map((category) => [category.id, category] as const),
);

const createUtcDate = (
  year: number,
  monthIndex: number,
  day: number,
  hour: number,
  minute: number,
): Date => new Date(Date.UTC(year, monthIndex, day, hour, minute, 0, 0));

const getDateContext = (): {
  currentYear: number;
  currentMonthIndex: number;
  previousYear: number;
  previousMonthIndex: number;
} => {
  const now = new Date();
  const currentYear = now.getUTCFullYear();
  const currentMonthIndex = now.getUTCMonth();
  const previousMonthDate = new Date(Date.UTC(currentYear, currentMonthIndex - 1, 1, 0, 0, 0, 0));

  return {
    currentYear,
    currentMonthIndex,
    previousYear: previousMonthDate.getUTCFullYear(),
    previousMonthIndex: previousMonthDate.getUTCMonth(),
  };
};

const buildDemoTransactions = (): SeedTransaction[] => {
  const { currentYear, currentMonthIndex, previousYear, previousMonthIndex } = getDateContext();

  return [
    {
      accountId: "1b921475-964f-45ec-8bf3-9d125a17f2e4",
      categoryId: "6855c0e9-d3ad-4100-99ef-e4efb5f7f5f2",
      type: "INCOME",
      amount: "1200.00",
      occurredAt: createUtcDate(currentYear, currentMonthIndex, 2, 9, 0),
      note: "Salary payout",
    },
    {
      accountId: "1b921475-964f-45ec-8bf3-9d125a17f2e4",
      categoryId: "8a419f44-6a55-42cb-a9e1-8db46f1d4fb5",
      type: "INCOME",
      amount: "480.00",
      occurredAt: createUtcDate(currentYear, currentMonthIndex, 8, 18, 30),
      note: "Part-time shift",
    },
    {
      accountId: "7f08d17a-26af-4f62-bf7d-e5804f65c18b",
      categoryId: "ed66902f-b144-49d6-bbc4-ef8f0dca7e2a",
      type: "INCOME",
      amount: "220.00",
      occurredAt: createUtcDate(currentYear, currentMonthIndex, 16, 14, 15),
      note: "Freelance design task",
    },
    {
      accountId: "1b921475-964f-45ec-8bf3-9d125a17f2e4",
      categoryId: "ace91e96-825e-4c5b-ba96-a98592ccb84f",
      type: "EXPENSE",
      amount: "550.00",
      occurredAt: createUtcDate(currentYear, currentMonthIndex, 3, 8, 0),
      note: "Monthly rent payment",
    },
    {
      accountId: "7f08d17a-26af-4f62-bf7d-e5804f65c18b",
      categoryId: "5cff2d77-6f9e-4d44-866b-fcae6ce09592",
      type: "EXPENSE",
      amount: "145.00",
      occurredAt: createUtcDate(currentYear, currentMonthIndex, 9, 12, 10),
      note: "Weekly groceries",
    },
    {
      accountId: "7f08d17a-26af-4f62-bf7d-e5804f65c18b",
      categoryId: "aa635379-9d19-437f-a53f-cf94d38b99aa",
      type: "EXPENSE",
      amount: "68.00",
      occurredAt: createUtcDate(currentYear, currentMonthIndex, 11, 7, 45),
      note: "Bus and train commute",
    },
    {
      accountId: "1b921475-964f-45ec-8bf3-9d125a17f2e4",
      categoryId: "97309f85-38df-4e39-bb4c-933b2fc0f897",
      type: "EXPENSE",
      amount: "90.00",
      occurredAt: createUtcDate(currentYear, currentMonthIndex, 18, 20, 0),
      note: "Internet and utilities",
    },
    {
      accountId: "1b921475-964f-45ec-8bf3-9d125a17f2e4",
      categoryId: "6855c0e9-d3ad-4100-99ef-e4efb5f7f5f2",
      type: "INCOME",
      amount: "600.00",
      occurredAt: createUtcDate(previousYear, previousMonthIndex, 2, 9, 0),
      note: "Allowance transfer",
    },
    {
      accountId: "7f08d17a-26af-4f62-bf7d-e5804f65c18b",
      categoryId: "8a419f44-6a55-42cb-a9e1-8db46f1d4fb5",
      type: "INCOME",
      amount: "350.00",
      occurredAt: createUtcDate(previousYear, previousMonthIndex, 12, 17, 0),
      note: "Consulting session income",
    },
    {
      accountId: "7f08d17a-26af-4f62-bf7d-e5804f65c18b",
      categoryId: "5cff2d77-6f9e-4d44-866b-fcae6ce09592",
      type: "EXPENSE",
      amount: "130.00",
      occurredAt: createUtcDate(previousYear, previousMonthIndex, 5, 13, 30),
      note: "Groceries refill",
    },
    {
      accountId: "7f08d17a-26af-4f62-bf7d-e5804f65c18b",
      categoryId: "aa635379-9d19-437f-a53f-cf94d38b99aa",
      type: "EXPENSE",
      amount: "58.00",
      occurredAt: createUtcDate(previousYear, previousMonthIndex, 14, 8, 20),
      note: "Ride-share and bus",
    },
    {
      accountId: "1b921475-964f-45ec-8bf3-9d125a17f2e4",
      categoryId: "821ee719-c91f-454d-9072-9f2ff1cc95d2",
      type: "EXPENSE",
      amount: "96.00",
      occurredAt: createUtcDate(previousYear, previousMonthIndex, 20, 16, 40),
      note: "Books and office supplies",
    },
  ];
};

const buildJournalEntries = (
  userId: string,
  transaction: SeedTransaction,
): Array<{
  userId: string;
  side: "DEBIT" | "CREDIT";
  accountType: "ASSET" | "REVENUE" | "EXPENSE";
  accountRefId: string | null;
  label: string;
  amount: Prisma.Decimal;
}> => {
  const account = accountById.get(transaction.accountId);
  const category = categoryById.get(transaction.categoryId);

  if (!account || !category) {
    throw new Error("Seed transaction references an unknown account or category id");
  }

  const amount = new Prisma.Decimal(transaction.amount);

  if (transaction.type === "INCOME") {
    return [
      {
        userId,
        side: "DEBIT",
        accountType: "ASSET",
        accountRefId: account.id,
        label: account.name,
        amount,
      },
      {
        userId,
        side: "CREDIT",
        accountType: "REVENUE",
        accountRefId: category.id,
        label: category.name,
        amount,
      },
    ];
  }

  return [
    {
      userId,
      side: "DEBIT",
      accountType: "EXPENSE",
      accountRefId: category.id,
      label: category.name,
      amount,
    },
    {
      userId,
      side: "CREDIT",
      accountType: "ASSET",
      accountRefId: account.id,
      label: account.name,
      amount,
    },
  ];
};

const upsertDemoUser = async (): Promise<{ id: string }> => {
  const passwordHash = await bcrypt.hash(DEMO_USER.password, SALT_ROUNDS);

  const user = await prisma.user.upsert({
    where: { email: DEMO_USER.email },
    update: {
      passwordHash,
      name: DEMO_USER.name,
      currency: DEMO_USER.currency,
      learningModeEnabled: DEMO_USER.learningModeEnabled,
    },
    create: {
      email: DEMO_USER.email,
      passwordHash,
      name: DEMO_USER.name,
      currency: DEMO_USER.currency,
      learningModeEnabled: DEMO_USER.learningModeEnabled,
    },
    select: { id: true },
  });

  return user;
};

const reseedDemoData = async (userId: string): Promise<SeedSummary> => {
  const demoTransactions = buildDemoTransactions();

  return prisma.$transaction(async (tx) => {
    await tx.journalEntry.deleteMany({ where: { userId } });
    await tx.transaction.deleteMany({ where: { userId } });
    await tx.category.deleteMany({ where: { userId } });
    await tx.account.deleteMany({ where: { userId } });

    await tx.account.createMany({
      data: DEMO_ACCOUNTS.map((account) => ({
        id: account.id,
        userId,
        name: account.name,
        type: account.type,
      })),
    });

    await tx.category.createMany({
      data: DEMO_CATEGORIES.map((category) => ({
        id: category.id,
        userId,
        name: category.name,
        type: category.type,
      })),
    });

    for (const transaction of demoTransactions) {
      await tx.transaction.create({
        data: {
          userId,
          accountId: transaction.accountId,
          categoryId: transaction.categoryId,
          type: transaction.type,
          amount: new Prisma.Decimal(transaction.amount),
          occurredAt: transaction.occurredAt,
          note: transaction.note,
          journalEntries: {
            create: buildJournalEntries(userId, transaction),
          },
        },
      });
    }

    return {
      accounts: DEMO_ACCOUNTS.length,
      categories: DEMO_CATEGORIES.length,
      transactions: demoTransactions.length,
      journalEntries: demoTransactions.length * 2,
    };
  });
};

async function main(): Promise<void> {
  await prisma.baselineMarker.upsert({
    where: { key: "baseline" },
    update: {},
    create: { key: "baseline" },
  });

  const demoUser = await upsertDemoUser();
  const summary = await reseedDemoData(demoUser.id);

  console.info("Seed completed for demo user", {
    email: DEMO_USER.email,
    ...summary,
  });
}

main()
  .catch(async (error: unknown) => {
    console.error("Seed failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

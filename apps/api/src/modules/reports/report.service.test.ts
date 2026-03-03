import assert from "node:assert/strict";
import { Prisma } from "../../../prisma/generated/client";
import { AppError } from "../../core/errors/app-error";
import { runSuite } from "../../test/unit-test-utils";
import { createReportService } from "./report.service";
import type { ReportRepository } from "./report.repository";

const buildRepository = (overrides?: Partial<ReportRepository>): ReportRepository => ({
  getTotalsByType: async () => ({
    income: new Prisma.Decimal("1000.00"),
    expense: new Prisma.Decimal("400.00"),
  }),
  getBreakdownGroupedByCategory: async (_userId, query) => {
    if (query.type === "INCOME") {
      return [
        {
          categoryId: "88888888-8888-8888-8888-888888888888",
          total: new Prisma.Decimal("1000.00"),
        },
      ];
    }

    return [
      {
        categoryId: "99999999-9999-9999-9999-999999999999",
        total: new Prisma.Decimal("300.00"),
      },
    ];
  },
  getCategoryNamesByIds: async () => [
    { id: "88888888-8888-8888-8888-888888888888", name: "Salary" },
    { id: "99999999-9999-9999-9999-999999999999", name: "Food" },
  ],
  getAccounts: async () => [{ id: "aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1", name: "Main Bank" }],
  getAccountTypeSumsToDate: async () => [
    {
      accountId: "aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1",
      type: "INCOME",
      total: new Prisma.Decimal("1000.00"),
    },
    {
      accountId: "aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1",
      type: "EXPENSE",
      total: new Prisma.Decimal("400.00"),
    },
  ],
  ...overrides,
});

export const runReportServiceTests = async (): Promise<number> => {
  return runSuite("reports.service", [
    {
      name: "monthly summary returns expected totals",
      run: async () => {
        const repository = buildRepository();
        const service = createReportService({ repository });

        const summary = await service.getMonthlySummary("user-id", { month: "2026-01" });

        assert.equal(summary.totalIncome, "1000.00");
        assert.equal(summary.totalExpense, "400.00");
        assert.equal(summary.net, "600.00");
      },
    },
    {
      name: "income statement throws on net mismatch",
      run: async () => {
        const repository = buildRepository({
          getTotalsByType: async () => ({
            income: new Prisma.Decimal("1000.00"),
            expense: new Prisma.Decimal("200.00"),
          }),
        });
        const service = createReportService({ repository });

        await assert.rejects(
          () => service.getIncomeStatement("user-id", { month: "2026-01" }),
          (error: unknown) => {
            assert.ok(error instanceof AppError);
            assert.equal(error.code, "INCOME_STATEMENT_NET_MISMATCH");
            assert.equal(error.statusCode, 500);
            return true;
          },
        );
      },
    },
    {
      name: "balance sheet throws when assets and equity are out of balance",
      run: async () => {
        const repository = buildRepository({
          getTotalsByType: async () => ({
            income: new Prisma.Decimal("1000.00"),
            expense: new Prisma.Decimal("100.00"),
          }),
        });
        const service = createReportService({ repository });

        await assert.rejects(
          () => service.getBalanceSheet("user-id", { asOf: "2026-01-31" }),
          (error: unknown) => {
            assert.ok(error instanceof AppError);
            assert.equal(error.code, "BALANCE_SHEET_NOT_BALANCED");
            assert.equal(error.statusCode, 500);
            return true;
          },
        );
      },
    },
  ]);
};

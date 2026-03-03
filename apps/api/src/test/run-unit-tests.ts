import { runAccountServiceTests } from "../modules/accounts/account.service.test";
import { runAuthServiceTests } from "../modules/auth/auth.service.test";
import { runCategoryServiceTests } from "../modules/categories/category.service.test";
import { runReportServiceTests } from "../modules/reports/report.service.test";
import { runTransactionServiceTests } from "../modules/transactions/transaction.service.test";

const run = async (): Promise<void> => {
  const failures = (
    await Promise.all([
      runCategoryServiceTests(),
      runAccountServiceTests(),
      runAuthServiceTests(),
      runTransactionServiceTests(),
      runReportServiceTests(),
    ])
  ).reduce((total, count) => total + count, 0);

  if (failures > 0) {
    // eslint-disable-next-line no-console
    console.error(`Unit tests failed: ${failures}`);
    process.exit(1);
  }

  // eslint-disable-next-line no-console
  console.log("All unit tests passed.");
};

void run();

export type UnitTestCase = {
  name: string;
  run: () => Promise<void> | void;
};

export const runSuite = async (suiteName: string, testCases: UnitTestCase[]): Promise<number> => {
  let failures = 0;

  for (const testCase of testCases) {
    try {
      await testCase.run();
      // eslint-disable-next-line no-console
      console.log(`PASS ${suiteName} :: ${testCase.name}`);
    } catch (error) {
      failures += 1;
      // eslint-disable-next-line no-console
      console.error(`FAIL ${suiteName} :: ${testCase.name}`);
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }

  return failures;
};

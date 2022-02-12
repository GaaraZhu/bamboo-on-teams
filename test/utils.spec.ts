import { isInvalidProdEnv, trim } from "../src/functions/utils";

describe("utils", () => {
  describe("emptyCheck", () => {
    const testCases = [
      {
        input: undefined,
        errorMessage: "empty argument",
      },
      {
        input: "",
        errorMessage: "empty argument",
      },
      {
        input: " ",
        errorMessage: "empty argument",
      },
      {
        input: "master",
        output: "master",
      },
      {
        input: "master ",
        output: "master",
      },
    ];

    testCases.forEach((testCase) => {
      it("Input: " + testCase.input, async () => {
        try {
          expect(trim(testCase.input)).toEqual(testCase.output);
        } catch (err: any) {
          expect(err.message).toEqual(testCase.errorMessage);
        }
      });
    });
  });

  describe("isInvalidProdEnv check", () => {
    const testCases = [
      {
        enabledForProd: "true",
        env: "Prod",
        expected: false,
      },
      {
        enabledForProd: "true",
        env: "Production",
        expected: false,
      },
      {
        enabledForProd: "true",
        env: "Product",
        expected: false,
      },
      {
        enabledForProd: "false",
        env: "Product",
        expected: true,
      },
      {
        enabledForProd: "false",
        env: "Prod",
        expected: true,
      },
      {
        enabledForProd: "false",
        env: "Production",
        expected: true,
      },
      {
        env: "Prod",
        expected: true,
      },
      {
        env: "Production",
        expected: true,
      },
    ];

    testCases.forEach((testCase) => {
      it(JSON.stringify(testCase), async () => {
        process.env.ENABLE_FOR_PROD = testCase.enabledForProd;
        expect(isInvalidProdEnv(testCase.env)).toEqual(testCase.expected);
      });
    });
  });
});

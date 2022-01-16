import { trim, prodEnvCheck } from "../../src/functions/utils";

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

  describe("prodEnvCheck", () => {
    const testCases = [
      {
        description: "prod disabled: check env prod",
        enabledForProd: "false",
        env: "prod",
        errorMessage: "Bamboo-on-teams is disabled for production environment",
      },
      {
        description: "prod disabled: check env preprod",
        enabledForProd: "FALSE",
        env: "preprod",
      },
      {
        description: "prod disabled: check env PROD",
        enabledForProd: "false",
        env: "PROD",
        errorMessage: "Bamboo-on-teams is disabled for production environment",
      },
      {
        description: "prod disabled: check env PROD",
        enabledForProd: "false",
        env: "PROD",
        errorMessage: "Bamboo-on-teams is disabled for production environment",
      },
    ];

    testCases.forEach((testCase) => {
      it(testCase.description, async () => {
        process.env.ENABLE_FOR_PROD = testCase.enabledForProd;
        try {
          expect(prodEnvCheck(testCase.env));
        } catch (err: any) {
          expect(err.message).toEqual(testCase.errorMessage);
        }
      });
    });
  });
});

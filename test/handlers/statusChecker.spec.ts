import { getJobPageUrl } from "../../src/functions/api/handlers/statusChecker";

process.env.BAMBOO_HOST_URL = "test.co.nz";

describe("statusChecker", () => {
  describe("getJobPageUrl", () => {
    const testCases = [
      {
        input: {
          resultKey: "API1-4",
          isBuild: true,
        },
        output: "https://test.co.nz/browse/API1-4",
      },
      {
        input: {
          resultKey: "1243",
          isBuild: false,
        },
        output:
          "https://test.co.nz/deploy/viewDeploymentResult.action?deploymentResultId=1243",
      },
      {
        input: {
          resultKey: " ",
          isBuild: true,
        },
        errorMessage: "empty resultKey",
      },
    ];

    testCases.forEach((testCase) => {
      it("Input: " + JSON.stringify(testCase.input), async () => {
        try {
          expect(
            getJobPageUrl(testCase.input.resultKey, testCase.input.isBuild)
          ).toEqual(testCase.output);
        } catch (err: any) {
          expect(err.message).toEqual(testCase.errorMessage);
        }
      });
    });
  });
});

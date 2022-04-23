import { CheckerInputType } from "../../src/functions/api/handlers/statusChecker";
import { TeamsUser } from "../../src/functions/models/teams";
import { getCheckerInput } from "../../src/functions/services/stepFunctionService";

process.env.STATUS_CHECKER_ARN = "test-arn";
const user: TeamsUser = {
  id: "1sdjckoli12",
  name: "james",
};

describe("stepFunctions", () => {
  const buildInput = {
    type: CheckerInputType.BUILD,
    resultKey: "101",
    resultUrl: "https://test.co.nz/browse/101",
    service: "customers-v1",
    branch: "master",
    buildNumber: "4",
    triggeredBy: user,
  };
  const deployBuildInput = {
    type: CheckerInputType.DEPLOY_BUILD,
    resultKey: "102",
    resultUrl: "https://test.co.nz/browse/102",
    service: "customers-v1",
    branch: "master",
    buildNumber: "4",
    environment: "test",
    triggeredBy: user,
  };
  const deployReleaseInput = {
    type: CheckerInputType.DEPLOY_RELEASE,
    resultKey: "103",
    resultUrl: "https://test.co.nz/browse/103",
    service: "customers-v1",
    release: "1.0.0",
    environment: "test",
    triggeredBy: user,
  };
  const testCases = [
    {
      name: "build job",
      input: {
        executionId: "101",
        checkerInput: buildInput,
      },
      output: {
        stateMachineArn: "test-arn",
        name: "101",
        input: JSON.stringify(buildInput),
        traceHeader: "101",
      },
    },
    {
      name: "deploy build job",
      input: {
        executionId: "102",
        checkerInput: deployBuildInput,
      },
      output: {
        stateMachineArn: "test-arn",
        name: "102",
        input: JSON.stringify(deployBuildInput),
        traceHeader: "102",
      },
    },
    {
      name: "deploy release job",
      input: {
        executionId: "103",
        checkerInput: deployReleaseInput,
      },
      output: {
        stateMachineArn: "test-arn",
        name: "103",
        input: JSON.stringify(deployReleaseInput),
        traceHeader: "103",
      },
    },
  ];

  testCases.forEach((testCase) => {
    it(testCase.name, async () => {
      const result = getCheckerInput(
        testCase.input.executionId,
        testCase.input.checkerInput
      );
      expect(result).toEqual(testCase.output);
    });
  });
});

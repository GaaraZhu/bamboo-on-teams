import {
  CheckerInputType,
  checkJobStatus,
  getJobPageUrl,
} from "../../src/functions/api/handlers/statusChecker";
import axios from "axios";
import { TeamsUser } from "../../src/functions/models/teams";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;
/* eslint-disable */process.env.APPLICATION_CONFIG = '{"bambooHostUrl": "test.co.nz"}';
const user: TeamsUser = {
  id: "1sdjckoli12",
  name: "james",
}
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

  describe("checkJobStatus", () => {
    const testCases = [
      {
        name: "finished build job",
        input: {
          event: {
            type: CheckerInputType.BUILD,
            resultKey: "API1-4",
            resultUrl: "https://test.co.nz/browse/API1-4",
            service: "customers-v1",
            branch: "master",
            buildNumber: "4",
            triggeredBy: user,
          },
          jobDetails: {
            key: "API1-4",
            planName: "customers-v1",
            lifeCycleState: "finished",
          },
        },
        output: {
          key: "API1-4",
          service: "customers-v1",
          branch: {
            name: "master",
          },
          lifeCycleState: "finished",
          url: "https://test.co.nz/rest/api/latest/result/API1-4",
        },
      },
      {
        name: "in progress build job",
        input: {
          event: {
            type: CheckerInputType.BUILD,
            resultKey: "API1-4",
            resultUrl: "https://test.co.nz/browse/API1-4",
            service: "customers-v1",
            branch: "master",
            buildNumber: "4",
            triggeredBy: user,
          },
          jobDetails: {
            key: "API1-4",
            lifeCycleState: "in_progress",
          },
        },
        errorName: "jobNotFinished",
      },
      {
        name: "cancelled build job",
        input: {
          event: {
            type: CheckerInputType.BUILD,
            resultKey: "API1-4",
            resultUrl: "https://test.co.nz/browse/API1-4",
            service: "customers-v1",
            branch: "master",
            buildNumber: "4",
            triggeredBy: user,
          },
          jobDetails: {
            key: "API1-4",
            planName: "customers-v1",
            lifeCycleState: "NotBuilt",
          },
        },
        output: {
          key: "API1-4",
          service: "customers-v1",
          branch: {
            name: "master",
          },
          lifeCycleState: "NotBuilt",
          url: "https://test.co.nz/rest/api/latest/result/API1-4",
        },
      },
      {
        name: "finished deploy build job",
        input: {
          event: {
            type: CheckerInputType.DEPLOY_BUILD,
            resultKey: "123",
            resultUrl: "https://test.co.nz/browse/123",
            service: "customers-v1",
            branch: "master",
            buildNumber: "4",
            environment: "test",
            triggeredBy: user,
          },
          jobDetails: {
            key: "123",
            lifeCycleState: "finished",
          },
        },
        output: {
          key: "123",
          lifeCycleState: "finished",
        },
      },
      {
        name: "in progress deploy build job",
        input: {
          event: {
            type: CheckerInputType.DEPLOY_BUILD,
            resultKey: "123",
            resultUrl: "https://test.co.nz/browse/123",
            service: "customers-v1",
            branch: "master",
            buildNumber: "4",
            environment: "test",
            triggeredBy: user,
          },
          jobDetails: {
            key: "123",
            lifeCycleState: "in_progress",
          },
        },
        errorName: "jobNotFinished",
      },
      {
        name: "finished deploy release job",
        input: {
          event: {
            type: CheckerInputType.DEPLOY_RELEASE,
            resultKey: "123",
            resultUrl: "https://test.co.nz/browse/123",
            service: "customers-v1",
            release: "1.0.0",
            environment: "test",
            triggeredBy: user,
          },
          jobDetails: {
            key: "123",
            lifeCycleState: "finished",
          },
        },
        output: {
          key: "123",
          lifeCycleState: "finished",
        },
      },
      {
        name: "in progress deploy release job",
        input: {
          event: {
            type: CheckerInputType.DEPLOY_RELEASE,
            resultKey: "123",
            resultUrl: "https://test.co.nz/browse/123",
            service: "customers-v1",
            release: "1.0.0",
            environment: "test",
            triggeredBy: user,
          },
          jobDetails: {
            key: "123",
            lifeCycleState: "in_progress",
          },
        },
        errorName: "jobNotFinished",
      },
    ];

    testCases.forEach((testCase) => {
      it(testCase.name, async () => {
        mockedAxios.get.mockReturnValueOnce(
          Promise.resolve({
            data: testCase.input.jobDetails,
          })
        );
        try {
          const result = await checkJobStatus(testCase.input.event, {});
          expect(result).toEqual(testCase.output);
        } catch (err: any) {
          console.log(err);
          expect(err.name).toEqual(testCase.errorName);
        }
      });
    });
  });
});

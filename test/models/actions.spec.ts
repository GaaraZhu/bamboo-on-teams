import { ActionName } from "../../src/functions/models/actions";
import { BuildAction } from "../../src/functions/models/buildAction";
import { DescBuildAction } from "../../src/functions/models/descBuildAction";
import { ListBuildsAction } from "../../src/functions/models/listBuildsAction";
import { ListBranchesAction } from "../../src/functions/models/listBranchesAction";
import { ListPlansAction } from "../../src/functions/models/listPlansAction";

describe("actions", () => {
  describe("BuildAction", () => {
    const buildCommandHelp =
      "Usage: build [options]\n\nOptions:\n  -s, --service <service>  service name, e.g. customers-v1\n  -b, --branch <branch>    bamboo branch name, e.g. master\n  -h, --help               display help for command\n";
    const testCases = [
      {
        command: "build -s customer-service -b master",
        expectedAction: {
          name: ActionName.BUILD,
          service: "customer-service",
          branch: "master",
        },
      },
      {
        command: "build -s customer-service -b master",
        expectedAction: {
          name: ActionName.BUILD,
          service: "customer-service",
          branch: "master",
        },
      },
      {
        command: "build --service=customer-service --branch=master",
        expectedAction: {
          name: ActionName.BUILD,
          service: "customer-service",
          branch: "master",
        },
      },
      {
        command: "build -b master -s customer-service",
        expectedAction: {
          name: ActionName.BUILD,
          service: "customer-service",
          branch: "master",
        },
      },
      {
        command: "build -b master -s customer-service -p test",
        error: {
          message: buildCommandHelp,
        },
      },
      {
        command: "build -s customer-service",
        error: {
          message: buildCommandHelp,
        },
      },
      {
        command: "build -b master",
        error: {
          message: buildCommandHelp,
        },
      },
      {
        command: "build",
        error: {
          message: buildCommandHelp,
        },
      },
    ];
    testCases.forEach((testCase) => {
      it(testCase.command, async () => {
        try {
          const actualAction = new BuildAction(testCase.command);
          expect(actualAction).toEqual(testCase.expectedAction);
        } catch (err) {
          expect(err).toEqual(testCase.error);
        }
      });
    });
  });

  describe("ListPlansAction", () => {
    it("build action correctly", async () => {
      process.env.BAMBOO_PROJECT_ID = "API";
      expect(new ListPlansAction()).toEqual({
        name: ActionName.LIST_PLANS,
        project: "API",
      });
    });
  });

  describe("ListBranchesAction", () => {
    const helpMessage =
      "Usage: list-branches [options]\n\nOptions:\n  -s, --service <service>  service name, e.g. customers-v1\n  -h, --help               display help for command\n";
    const testCases = [
      {
        command: "list-branches -s customers-v1",
        expectedAction: {
          name: ActionName.LIST_BRANCHES,
          planName: "customers-v1",
        },
      },
      {
        command: "list-branches --service customers-v1",
        expectedAction: {
          name: ActionName.LIST_BRANCHES,
          planName: "customers-v1",
        },
      },
      {
        command: "list-branches -s customers-v1 -b master",
        error: {
          message: helpMessage,
        },
      },
      {
        command: "list-branches -s",
        error: {
          message: helpMessage,
        },
      },
      {
        command: "list-branches s-s",
        error: {
          message: helpMessage,
        },
      },
      {
        command: "list-branches",
        error: {
          message: helpMessage,
        },
      },
    ];
    testCases.forEach((testCase) => {
      it(testCase.command, async () => {
        try {
          const actualAction = new ListBranchesAction(testCase.command);
          expect(actualAction).toEqual(testCase.expectedAction);
        } catch (err) {
          expect(err).toEqual(testCase.error);
        }
      });
    });
  });

  describe("ListBuildsAction", () => {
    const helpMessage =
      "Usage: list-builds [options]\n\nOptions:\n  -s, --service <service>  service name, e.g. customers-v1\n  -b, --branch <branch>    bamboo branch name, e.g. release-1.0.0\n  -h, --help               display help for command\n";
    const testCases = [
      {
        command: "list-builds -s customers-v1 -b release-1.0.0",
        expectedAction: {
          name: ActionName.LIST_BUILDS,
          planName: "customers-v1",
          branchName: "release-1.0.0",
        },
      },
      {
        command: "list-builds --service customers-v1 --branch release-1.0.0",
        expectedAction: {
          name: ActionName.LIST_BUILDS,
          planName: "customers-v1",
          branchName: "release-1.0.0",
        },
      },
      {
        command: "list-builds --b release-1.0.0",
        error: {
          message: helpMessage,
        },
      },
      {
        command: "list-builds -b",
        error: {
          message: helpMessage,
        },
      },
      {
        command: "list-builds s-b",
        error: {
          message: helpMessage,
        },
      },
      {
        command: "list-builds",
        error: {
          message: helpMessage,
        },
      },
    ];
    testCases.forEach((testCase) => {
      it(testCase.command, async () => {
        try {
          const actualAction = new ListBuildsAction(testCase.command);
          expect(actualAction).toEqual(testCase.expectedAction);
        } catch (err) {
          expect(err).toEqual(testCase.error);
        }
      });
    });
  });

  describe("DescBuildAction", () => {
    const lastBuildCommandHelp =
      "Usage: desc-build [options]\n\nOptions:\n  -k, --key <key>  build key, e.g. API-CCV28-1\n  -h, --help       display help for command\n";
    const testCases = [
      {
        command: "desc-build -k API-CJI-2",
        expectedAction: {
          name: ActionName.DESC_BUILD,
          key: "API-CJI-2",
        },
      },
      {
        command: "desc-build -kAPI-CJI-2",
        expectedAction: {
          name: ActionName.DESC_BUILD,
          key: "API-CJI-2",
        },
      },
      {
        command: "desc-build --key API-CJI-2",
        expectedAction: {
          name: ActionName.DESC_BUILD,
          key: "API-CJI-2",
        },
      },
      {
        command: "desc-build -k",
        error: {
          message: lastBuildCommandHelp,
        },
      },
      {
        command: "desc-build -k5 -p",
        error: {
          message: lastBuildCommandHelp,
        },
      },
      {
        command: "desc-build",
        error: {
          message: lastBuildCommandHelp,
        },
      },
    ];
    testCases.forEach((testCase) => {
      it(testCase.command, async () => {
        try {
          const actualAction = new DescBuildAction(testCase.command);
          expect(actualAction).toEqual(testCase.expectedAction);
        } catch (err) {
          expect(err).toEqual(testCase.error);
        }
      });
    });
  });
});

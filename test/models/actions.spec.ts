import { ActionName } from "../../src/functions/models/actions";
import { BuildAction } from "../../src/functions/models/buildAction";
import { ListPlanBranchBuildsAction } from "../../src/functions/models/listPlanBranchBuildsAction";
import { ListPlanBranchesAction } from "../../src/functions/models/listPlanBranchesAction";
import { ListPlansAction } from "../../src/functions/models/listPlansCommand";

describe("actions", () => {
  describe("BuildAction", () => {
    const buildCommandHelp =
      "Usage: build [options]\n\nOptions:\n  -s, --service <service>  service name, e.g. customers-v1\n  -b, --branch <branch>    branch name, e.g. master\n  -h, --help               display help for command\n";
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

  describe("ListPlanBranchesAction", () => {
    const helpMessage =
      "Usage: list-branches [options]\n\nOptions:\n  -pn, --planName <planName>  the case insensitive plan name, e.g. customers-v1\n  -h, --help                  display help for command\n";
    const testCases = [
      {
        command: "list-branches -pn customers-v1",
        expectedAction: {
          name: ActionName.LIST_PLAN_BRANCHES,
          planName: "customers-v1",
        },
      },
      {
        command: "list-branches --pn customers-v1",
        error: {
          message: helpMessage,
        },
      },
      {
        command: "list-branches -pk customers-v1 -b master",
        error: {
          message: helpMessage,
        },
      },
      {
        command: "list-branches -pn",
        error: {
          message: helpMessage,
        },
      },
      {
        command: "list-branches s-pn",
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
          const actualAction = new ListPlanBranchesAction(testCase.command);
          expect(actualAction).toEqual(testCase.expectedAction);
        } catch (err) {
          expect(err).toEqual(testCase.error);
        }
      });
    });
  });

  describe("ListPlanBranchBuildsAction", () => {
    const helpMessage =
      "Usage: list-builds [options]\n\nOptions:\n  -bn, --branchName <branchName>  plan branch name, e.g. release-1.0.0\n  -h, --help                      display help for command\n";
    const testCases = [
      {
        command: "list-builds -bn release-1.0.0",
        expectedAction: {
          name: ActionName.LIST_PLAN_BRANCH_BUILDS,
          planBranchName: "release-1.0.0",
        },
      },
      {
        command: "list-builds --branchName release-1.0.0",
        expectedAction: {
          name: ActionName.LIST_PLAN_BRANCH_BUILDS,
          planBranchName: "release-1.0.0",
        },
      },
      {
        command: "list-builds --bn release-1.0.0",
        error: {
          message: helpMessage,
        },
      },
      {
        command: "list-builds -bn",
        error: {
          message: helpMessage,
        },
      },
      {
        command: "list-builds s-bn",
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
          const actualAction = new ListPlanBranchBuildsAction(testCase.command);
          expect(actualAction).toEqual(testCase.expectedAction);
        } catch (err) {
          expect(err).toEqual(testCase.error);
        }
      });
    });
  });
});

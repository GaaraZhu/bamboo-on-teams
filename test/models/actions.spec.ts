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
          action: ActionName.BUILD,
          service: "customer-service",
          branch: "master",
        },
      },
      {
        command: "build -s customer-service -b master",
        expectedAction: {
          action: ActionName.BUILD,
          service: "customer-service",
          branch: "master",
        },
      },
      {
        command: "build --service=customer-service --branch=master",
        expectedAction: {
          action: ActionName.BUILD,
          service: "customer-service",
          branch: "master",
        },
      },
      {
        command: "build -b master -s customer-service",
        expectedAction: {
          action: ActionName.BUILD,
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
      process.env.BAMBOO_PROJECT = "API";
      expect(new ListPlansAction()).toEqual({
        action: ActionName.LIST_PLANS,
        project: "API",
      });
    });
  });

  describe("ListPlanBranchesAction", () => {
    const helpMessage =
      "Usage: list-branches [options]\n\nOptions:\n  -pk, --planKey <planKey>  the plan identifier\n  -h, --help                display help for command\n";
    const testCases = [
      {
        command: "list-branches -pk CPV1",
        expectedAction: {
          action: ActionName.LIST_PLAN_BRANCHES,
          planKey: "CPV1",
        },
      },
      {
        command: "list-branches --pk CPV1",
        error: {
          message: helpMessage,
        },
      },
      {
        command: "list-branches -pk CPV1 -b master",
        error: {
          message: helpMessage,
        },
      },
      {
        command: "list-branches -pk",
        error: {
          message: helpMessage,
        },
      },
      {
        command: "list-branches s-pk",
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
      "Usage: list-builds [options]\n\nOptions:\n  -bk, --branchKey <branchKey>  branch job identifier\n  -h, --help                    display help for command\n";
    const testCases = [
      {
        command: "list-builds -bk BPK1",
        expectedAction: {
          action: ActionName.LIST_PLAN_BRANCH_BUILDS,
          planBranchKey: "BPK1",
        },
      },
      {
        command: "list-builds --bk BPK1",
        error: {
          message: helpMessage,
        },
      },
      {
        command: "list-builds -bk",
        error: {
          message: helpMessage,
        },
      },
      {
        command: "list-builds s-bk",
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

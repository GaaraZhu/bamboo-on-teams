import {
  ActionNames,
  ListPlanBranchBuildsAction,
  ListPlanBranchesAction,
  ListPlansAction,
} from "../../src/functions/api/models/actions";
import { BuildAction } from "../../src/functions/api/models/buildAction";

describe("actions", () => {
  describe("BuildAction", () => {
    it("build action correctly", async () => {
      const buildCommandHelp = "Usage: build [options]\n\nOptions:\n  -s, --service <service>  service name, e.g. customers-v1\n  -b, --branch <branch>    branch name, e.g. master\n  -h, --help               display help for command\n"
      const testCases = [
        {
          command: "build -s customer-service -b master",
          expectedAction: {
            action: ActionNames.BUILD,
            service: "customer-service",
            branch: "master",
          },
        },
        {
          command: "build -s customer-service -b master",
          expectedAction: {
            action: ActionNames.BUILD,
            service: "customer-service",
            branch: "master",
          },
        },
        {
          command: "build --service=customer-service --branch=master",
          expectedAction: {
            action: ActionNames.BUILD,
            service: "customer-service",
            branch: "master",
          },
        },
        {
          command: "build -b master -s customer-service",
          expectedAction: {
            action: ActionNames.BUILD,
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
        action: ActionNames.LIST_PLANS,
        project: "API",
      });
    });
  });

  describe("ListPlanBranchesAction", () => {
    it("build action correctly", async () => {
      const testCases = [
        {
          command: "list-branches -planKey=CPV1",
          expectedAction: {
            action: ActionNames.LIST_PLAN_BRANCHES,
            planKey: "cpv1",
          },
        },
        {
          command: "list-branches --planKey=CPV1",
          expectedAction: {
            action: ActionNames.LIST_PLAN_BRANCHES,
            planKey: "cpv1",
          },
        },
        {
          command: "list-branches -planKey=CPV1 -branch=master",
          expectedAction: {
            action: ActionNames.LIST_PLAN_BRANCHES,
            planKey: "cpv1",
          },
        },
        {
          command: "list-branches -planKey=",
          error: {
            message: "Usage: list-branches -planKey=[planKey]",
          },
        },
        {
          command: "list-branches s-planKey=",
          error: {
            message: "Usage: list-branches -planKey=[planKey]",
          },
        },
        {
          command: "list-branches",
          error: {
            message: "Usage: list-branches -planKey=[planKey]",
          },
        },
      ];
      testCases.forEach((testCase) => {
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
    it("build action correctly", async () => {
      const testCases = [
        {
          command: "list-builds -branchKey=BPK1",
          expectedAction: {
            action: ActionNames.LIST_PLAN_BRANCH_BUILDS,
            planBranchKey: "bpk1",
          },
        },
        {
          command: "list-builds --branchKey=BPK1",
          expectedAction: {
            action: ActionNames.LIST_PLAN_BRANCH_BUILDS,
            planBranchKey: "bpk1",
          },
        },
        {
          command: "list-builds -branchKey= BPK1",
          error: {
            message: "Usage: list-builds -branchKey=[branchKey]",
          },
        },
        {
          command: "list-builds -branchKey=",
          error: {
            message: "Usage: list-builds -branchKey=[branchKey]",
          },
        },
        {
          command: "list-builds s-branchKey=",
          error: {
            message: "Usage: list-builds -branchKey=[branchKey]",
          },
        },
        {
          command: "list-builds",
          error: {
            message: "Usage: list-builds -branchKey=[branchKey]",
          },
        },
      ];
      testCases.forEach((testCase) => {
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

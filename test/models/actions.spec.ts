import { ActionName } from "../../src/functions/models/actions";
import { BuildAction } from "../../src/functions/models/buildAction";
import { DescBuildAction } from "../../src/functions/models/descBuildAction";
import { ListBuildsAction } from "../../src/functions/models/listBuildsAction";
import { ListBranchesAction } from "../../src/functions/models/listBranchesAction";
import { ListPlansAction } from "../../src/functions/models/listPlansAction";
import { CreateBranchAction } from "../../src/functions/models/createBranchAction";
import { ListEnvironmentsAction } from "../../src/functions/models/listEnvironmentsAction";
import { ListDeploymentProjectsAction } from "../../src/functions/models/listDeploymentProjects";

describe("actions", () => {
  describe("BuildAction", () => {
    const buildCommandHelp = `Usage: build [options]

Trigger a branch build for a service.

Options:
  -s, --service <service>  service name, e.g. customers-v1
  -b, --branch <branch>    bamboo branch name, e.g. master
  -h, --help               display help for command
`;

    const testCases = [
      {
        command: "build -s customer-service -b master",
        expectedAction: {
          actionName: ActionName.BUILD,
          service: "customer-service",
          branch: "master",
          triggeredBy: "james",
        },
      },
      {
        command: "build -s customer-service --branch master",
        expectedAction: {
          actionName: ActionName.BUILD,
          service: "customer-service",
          branch: "master",
          triggeredBy: "james",
        },
      },
      {
        command: "build --service=customer-service --branch=master",
        expectedAction: {
          actionName: ActionName.BUILD,
          service: "customer-service",
          branch: "master",
          triggeredBy: "james",
        },
      },
      {
        command: "build -b master -s customer-service",
        expectedAction: {
          actionName: ActionName.BUILD,
          service: "customer-service",
          branch: "master",
          triggeredBy: "james",
        },
      },
      {
        command: "build -b master -s customer-service -p test",
        error: {
          status: 400,
          message: buildCommandHelp,
        },
      },
      {
        command: "build -s customer-service",
        error: {
          status: 400,
          message: buildCommandHelp,
        },
      },
      {
        command: "build -b master",
        error: {
          status: 400,
          message: buildCommandHelp,
        },
      },
      {
        command: "build",
        error: {
          status: 400,
          message: buildCommandHelp,
        },
      },
    ];
    testCases.forEach((testCase) => {
      it(testCase.command, async () => {
        try {
          const actualAction = new BuildAction(testCase.command, "james");
          expect(actualAction).toEqual(testCase.expectedAction);
        } catch (err) {
          expect(err).toEqual(testCase.error);
        }
      });
    });
  });

  describe("ListPlansAction", () => {
    it("create list plans action correctly", async () => {
      process.env.BAMBOO_PROJECT_ID = "API";
      expect(new ListPlansAction("james")).toEqual({
        actionName: ActionName.LIST_PLANS,
        triggeredBy: "james",
        project: "API",
      });
    });
  });

  describe("ListBranchesAction", () => {
    const helpMessage = `Usage: list-branches [options]

List branch plans for a service.

Options:
  -s, --service <service>  service name, e.g. customers-v1
  -h, --help               display help for command
`;
    const testCases = [
      {
        command: "list-branches -s customers-v1",
        expectedAction: {
          actionName: ActionName.LIST_BRANCHES,
          planName: "customers-v1",
          triggeredBy: "james",
        },
      },
      {
        command: "list-branches --service customers-v1",
        expectedAction: {
          actionName: ActionName.LIST_BRANCHES,
          planName: "customers-v1",
          triggeredBy: "james",
        },
      },
      {
        command: "list-branches -s customers-v1 -b master",
        error: {
          status: 400,
          message: helpMessage,
        },
      },
      {
        command: "list-branches -s",
        error: {
          status: 400,
          message: helpMessage,
        },
      },
      {
        command: "list-branches s-s",
        error: {
          status: 400,
          message: helpMessage,
        },
      },
      {
        command: "list-branches",
        error: {
          status: 400,
          message: helpMessage,
        },
      },
    ];
    testCases.forEach((testCase) => {
      it(testCase.command, async () => {
        try {
          const actualAction = new ListBranchesAction(
            testCase.command,
            "james"
          );
          expect(actualAction).toEqual(testCase.expectedAction);
        } catch (err) {
          expect(err).toEqual(testCase.error);
        }
      });
    });
  });

  describe("ListBuildsAction", () => {
    const helpMessage = `Usage: list-builds [options]

List builds for a service in a branch plan.

Options:
  -s, --service <service>  service name, e.g. customers-v1
  -b, --branch <branch>    bamboo branch name, e.g. release-1.0.0
  -h, --help               display help for command
`;
    const testCases = [
      {
        command: "list-builds -s customers-v1 -b release-1.0.0",
        expectedAction: {
          actionName: ActionName.LIST_BUILDS,
          planName: "customers-v1",
          branchName: "release-1.0.0",
          triggeredBy: "james",
        },
      },
      {
        command: "list-builds --service customers-v1 --branch release-1.0.0",
        expectedAction: {
          actionName: ActionName.LIST_BUILDS,
          planName: "customers-v1",
          branchName: "release-1.0.0",
          triggeredBy: "james",
        },
      },
      {
        command: "list-builds --b release-1.0.0",
        error: {
          status: 400,
          message: helpMessage,
        },
      },
      {
        command: "list-builds -b",
        error: {
          status: 400,
          message: helpMessage,
        },
      },
      {
        command: "list-builds s-b",
        error: {
          status: 400,
          message: helpMessage,
        },
      },
      {
        command: "list-builds",
        error: {
          status: 400,
          message: helpMessage,
        },
      },
    ];
    testCases.forEach((testCase) => {
      it(testCase.command, async () => {
        try {
          const actualAction = new ListBuildsAction(testCase.command, "james");
          expect(actualAction).toEqual(testCase.expectedAction);
        } catch (err) {
          expect(err).toEqual(testCase.error);
        }
      });
    });
  });

  describe("DescBuildAction", () => {
    const lastBuildCommandHelp = `Usage: desc-build [options]

Describe a build.

Options:
  -b, --build <build>  build key, e.g. API-CCV28-1
  -h, --help           display help for command
`;
    const testCases = [
      {
        command: "desc-build -b API-CJI-2",
        expectedAction: {
          actionName: ActionName.DESC_BUILD,
          build: "API-CJI-2",
          triggeredBy: "james",
        },
      },
      {
        command: "desc-build -bAPI-CJI-2",
        expectedAction: {
          actionName: ActionName.DESC_BUILD,
          build: "API-CJI-2",
          triggeredBy: "james",
        },
      },
      {
        command: "desc-build --build API-CJI-2",
        expectedAction: {
          actionName: ActionName.DESC_BUILD,
          build: "API-CJI-2",
          triggeredBy: "james",
        },
      },
      {
        command: "desc-build -b",
        error: {
          status: 400,
          message: lastBuildCommandHelp,
        },
      },
      {
        command: "desc-build -b5 -p",
        error: {
          status: 400,
          message: lastBuildCommandHelp,
        },
      },
      {
        command: "desc-build",
        error: {
          status: 400,
          message: lastBuildCommandHelp,
        },
      },
    ];
    testCases.forEach((testCase) => {
      it(testCase.command, async () => {
        try {
          const actualAction = new DescBuildAction(testCase.command, "james");
          expect(actualAction).toEqual(testCase.expectedAction);
        } catch (err) {
          expect(err).toEqual(testCase.error);
        }
      });
    });
  });

  describe("CreateBranchAction", () => {
    const helpMessage = `Usage: create-branch [options]

Create branch for a plan.

Options:
  -s, --service <service>  service name, e.g. customers-v1
  -b, --branch <branch>    vcsBranch name, e.g. master
  -h, --help               display help for command
`;
    const testCases = [
      {
        command: "create-branch -s customers-v1 -b dev",
        expectedAction: {
          actionName: ActionName.CREATE_BRANCH,
          planName: "customers-v1",
          vscBranch: "dev",
          triggeredBy: "james",
        },
      },
      {
        command: "create-branch -scustomers-v1 -bdev",
        expectedAction: {
          actionName: ActionName.CREATE_BRANCH,
          planName: "customers-v1",
          vscBranch: "dev",
          triggeredBy: "james",
        },
      },
      {
        command: "create-branch -s",
        error: {
          status: 400,
          message: helpMessage,
        },
      },
      {
        command: "create-branch -scustomers-v1 -b",
        error: {
          status: 400,
          message: helpMessage,
        },
      },
      {
        command: "create-branch",
        error: {
          status: 400,
          message: helpMessage,
        },
      },
    ];
    testCases.forEach((testCase) => {
      it(testCase.command, async () => {
        try {
          const actualAction = new CreateBranchAction(testCase.command, "james");
          expect(actualAction).toEqual(testCase.expectedAction);
        } catch (err) {
          expect(err).toEqual(testCase.error);
        }
      });
    });
  });

  describe("ListEnvironmentsAction", () => {
    const helpMessage = `Usage: list-envs [options]

List available environments for a service.

Options:
  -s, --service <service>  service name, e.g. customers-v1
  -h, --help               display help for command
`;
    const testCases = [
      {
        command: "list-envs -s customers-v1",
        expectedAction: {
          actionName: ActionName.LIST_ENVS,
          deploymentProject: "customers-v1",
          triggeredBy: "james",
        },
      },
      {
        command: "list-envs -scustomers-v1",
        expectedAction: {
          actionName: ActionName.LIST_ENVS,
          deploymentProject: "customers-v1",
          triggeredBy: "james",
        },
      },
      {
        command: "list-envs -s",
        error: {
          status: 400,
          message: helpMessage,
        },
      },
      {
        command: "list-envs -scustomers-v1 -b",
        error: {
          status: 400,
          message: helpMessage,
        },
      },
      {
        command: "list-envs",
        error: {
          status: 400,
          message: helpMessage,
        },
      },
    ];
    testCases.forEach((testCase) => {
      it(testCase.command, async () => {
        try {
          const actualAction = new ListEnvironmentsAction(testCase.command, "james");
          expect(actualAction).toEqual(testCase.expectedAction);
        } catch (err) {
          expect(err).toEqual(testCase.error);
        }
      });
    });

    describe("ListProjectsAction", () => {
      it("create list projects action correctly", async () => {
        expect(new ListDeploymentProjectsAction("james")).toEqual({
          actionName: ActionName.LIST_DEPLOY_PROJECTS,
          triggeredBy: "james",
        });
      });
    });
  });
});

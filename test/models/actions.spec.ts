import { ActionName } from "../../src/functions/models/actions";
import { BuildAction } from "../../src/functions/models/buildAction";
import { DescBuildAction } from "../../src/functions/models/descBuildAction";
import { ListBuildsAction } from "../../src/functions/models/listBuildsAction";
import { ListBranchesAction } from "../../src/functions/models/listBranchesAction";
import { ListPlansAction } from "../../src/functions/models/listPlansAction";
import { CreateBranchAction } from "../../src/functions/models/createBranchAction";
import { ListEnvironmentsAction } from "../../src/functions/models/listEnvironmentsAction";
import { ListDeploymentProjectsAction } from "../../src/functions/models/listDeploymentProjects";
import { ListReleasesAction } from "../../src/functions/models/listReleasesAction";
import { ListDeploysAction } from "../../src/functions/models/listDeploysAction";
import { CreateReleaseAction } from "../../src/functions/models/createReleaseAction";
import { DeployLatestBuildAction } from "../../src/functions/models/deployLatestBuildAction";
import { DeployReleaseAction } from "../../src/functions/models/deployReleaseAction";
import { DeployBuildAction } from "../../src/functions/models/deployBuildAction";
import { PromoteReleaseAction } from "../../src/functions/models/promoteReleaseAction";

describe("actions", () => {
  describe("BuildAction", () => {
    const buildCommandHelp = `Usage: build [options]

Trigger branch build for service(s).

Options:
  -s, --services <services>  service names separated by comma without spaces,
                             e.g. customers-v1,accounts-v1
  -b, --branch <branch>      bamboo branch name, e.g. master
  -h, --help                 display help for command
`;

    const testCases = [
      {
        command: "build -s customer-service -b master",
        expectedAction: {
          actionName: ActionName.BUILD,
          services: ["customer-service"],
          branch: "master",
          triggeredBy: "james",
        },
      },
      {
        command: "build -s customer-service,account-service -b master",
        expectedAction: {
          actionName: ActionName.BUILD,
          services: ["customer-service", "account-service"],
          branch: "master",
          triggeredBy: "james",
        },
      },
      {
        command: "build -s customer-service --branch master",
        expectedAction: {
          actionName: ActionName.BUILD,
          services: ["customer-service"],
          branch: "master",
          triggeredBy: "james",
        },
      },
      {
        command: "build --services=customer-service --branch=master",
        expectedAction: {
          actionName: ActionName.BUILD,
          services: ["customer-service"],
          branch: "master",
          triggeredBy: "james",
        },
      },
      {
        command: "build -b master -s customer-service",
        expectedAction: {
          actionName: ActionName.BUILD,
          services: ["customer-service"],
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
      expect(new ListPlansAction("james")).toEqual({
        actionName: ActionName.LIST_PLANS,
        triggeredBy: "james",
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
  -s, --service <service>       service name, e.g. customers-v1
  -b, --vcs-branch <vcsBranch>  vcsBranch name, e.g. master
  -h, --help                    display help for command
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
        command: "create-branch -scustomers-v1 -b dev",
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
          const actualAction = new CreateBranchAction(
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

  describe("ListProjectsAction", () => {
    it("create list projects action correctly", async () => {
      expect(new ListDeploymentProjectsAction("james")).toEqual({
        actionName: ActionName.LIST_DEPLOY_PROJECTS,
        triggeredBy: "james",
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
          const actualAction = new ListEnvironmentsAction(
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

  describe("ListReleasesAction", () => {
    const helpMessage = `Usage: list-releases [options]

List the releases created from a service branch.

Options:
  -s, --service <service>  service name, e.g. customers-v1
  -b, --branch <branch>    bamboo branch name, e.g. master
  -h, --help               display help for command
`;
    const testCases = [
      {
        command: "list-releases -s customers-v1 -b master",
        expectedAction: {
          actionName: ActionName.LIST_RELEASES,
          deploymentProject: "customers-v1",
          planBranch: "master",
          triggeredBy: "james",
        },
      },
      {
        command: "list-releases -scustomers-v1 -bmaster",
        expectedAction: {
          actionName: ActionName.LIST_RELEASES,
          deploymentProject: "customers-v1",
          planBranch: "master",
          triggeredBy: "james",
        },
      },
      {
        command: "list-releases -s",
        error: {
          status: 400,
          message: helpMessage,
        },
      },
      {
        command: "list-releases -scustomers-v1 -b",
        error: {
          status: 400,
          message: helpMessage,
        },
      },
      {
        command: "list-releases",
        error: {
          status: 400,
          message: helpMessage,
        },
      },
    ];
    testCases.forEach((testCase) => {
      it(testCase.command, async () => {
        try {
          const actualAction = new ListReleasesAction(
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

  describe("ListDeploysAction", () => {
    const helpMessage = `Usage: list-deploys [options]

List the deployments in a service environment.

Options:
  -s, --service <service>  service name, e.g. customers-v1
  -e, --env <env>          env name, e.g. dev
  -h, --help               display help for command
`;
    const testCases = [
      {
        command: "list-deploys -s customers-v1 -e test",
        expectedAction: {
          actionName: ActionName.LIST_DEPLOYS,
          deploymentProject: "customers-v1",
          env: "test",
          triggeredBy: "james",
        },
      },
      {
        command: "list-deploys -scustomers-v1 -etest",
        expectedAction: {
          actionName: ActionName.LIST_DEPLOYS,
          deploymentProject: "customers-v1",
          env: "test",
          triggeredBy: "james",
        },
      },
      {
        command: "list-deploys -s",
        error: {
          status: 400,
          message: helpMessage,
        },
      },
      {
        command: "list-deploys -scustomers-v1 -e",
        error: {
          status: 400,
          message: helpMessage,
        },
      },
      {
        command: "list-deploys",
        error: {
          status: 400,
          message: helpMessage,
        },
      },
    ];
    testCases.forEach((testCase) => {
      it(testCase.command, async () => {
        try {
          const actualAction = new ListDeploysAction(testCase.command, "james");
          expect(actualAction).toEqual(testCase.expectedAction);
        } catch (err) {
          expect(err).toEqual(testCase.error);
        }
      });
    });
  });

  describe("CreateReleaseAction", () => {
    const helpMessage = `Usage: create-release [options]

Create a release for a service build.

Options:
  -s, --service <service>  service name, e.g. customers-v1
  -b, --build <build>      build key, e.g. API-CCV28-1
  -r, --release <release>  release name, e.g. v1.0.0
  -h, --help               display help for command
`;
    const testCases = [
      {
        command: "create-release -s customers-v1 -b API-3 -r v1.0.0",
        expectedAction: {
          actionName: ActionName.CREATE_RELEASE,
          deploymentProject: "customers-v1",
          buildKey: "API-3",
          releaseName: "v1.0.0",
          triggeredBy: "james",
        },
      },
      {
        command: "create-release -scustomers-v1 -bAPI-3 -rv1.0.0",
        expectedAction: {
          actionName: ActionName.CREATE_RELEASE,
          deploymentProject: "customers-v1",
          buildKey: "API-3",
          releaseName: "v1.0.0",
          triggeredBy: "james",
        },
      },
      {
        command: "create-release -scustomers-v1 -bAPI-3",
        error: {
          status: 400,
          message: helpMessage,
        },
      },
      {
        command: "create-release -scustomers-v1 -bAPI-3 -r ",
        error: {
          status: 400,
          message: helpMessage,
        },
      },
      {
        command: "create-release",
        error: {
          status: 400,
          message: helpMessage,
        },
      },
    ];
    testCases.forEach((testCase) => {
      it(testCase.command, async () => {
        try {
          const actualAction = new CreateReleaseAction(
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

  describe("DeployLatestAction", () => {
    const helpMessage = `Usage: deploy-latest [options]

Deploy the service with the latest build in a branch to an environment.

Options:
  -s, --service <service>  service name, e.g. customers-v1
  -b, --branch <branch>    bamboo branch name, e.g. master
  -e, --env <env>          env name, e.g. dev
  -h, --help               display help for command
`;
    const testCases = [
      {
        command: "deploy-latest -s customers-v1 -b master -e test",
        expectedAction: {
          actionName: ActionName.DEPLOY_LATEST_BUILD,
          service: "customers-v1",
          branch: "master",
          env: "test",
          triggeredBy: "james",
        },
      },
      {
        command: "deploy-latest -s customers-v1 -b master -e test",
        expectedAction: {
          actionName: ActionName.DEPLOY_LATEST_BUILD,
          service: "customers-v1",
          branch: "master",
          env: "test",
          triggeredBy: "james",
        },
      },
      {
        command: "deploy-latest -s customers-v1 -b -e test",
        error: {
          status: 400,
          message: helpMessage,
        },
      },
      {
        command: "deploy-latest",
        error: {
          status: 400,
          message: helpMessage,
        },
      },
    ];
    testCases.forEach((testCase) => {
      it(testCase.command, async () => {
        try {
          const actualAction = new DeployLatestBuildAction(
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

  describe("DeployReleaseAction", () => {
    const helpMessage = `Usage: deploy-release [options]

Deploy a release to a service environment.

Options:
  -s, --service <service>  service name, e.g. customers-v1
  -e, --env <env>          env name, e.g. dev
  -r, --release <release>  release name, e.g. v1.0.0
  -h, --help               display help for command
`;
    const testCases = [
      {
        command: "deploy-release -s customers-v1 -e test -r v1.0.0",
        expectedAction: {
          actionName: ActionName.DEPLOY_RELEASE,
          service: "customers-v1",
          env: "test",
          releaseName: "v1.0.0",
          triggeredBy: "james",
        },
      },
      {
        command: "deploy-release -scustomers-v1 -e test -rv1.0.0",
        expectedAction: {
          actionName: ActionName.DEPLOY_RELEASE,
          service: "customers-v1",
          env: "test",
          releaseName: "v1.0.0",
          triggeredBy: "james",
        },
      },
      {
        command: "deploy-release -s customers-v1 -r -e test",
        error: {
          status: 400,
          message: helpMessage,
        },
      },
      {
        command: "deploy-release",
        error: {
          status: 400,
          message: helpMessage,
        },
      },
    ];
    testCases.forEach((testCase) => {
      it(testCase.command, async () => {
        try {
          const actualAction = new DeployReleaseAction(
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

  describe("DeployBuildAction", () => {
    const helpMessage = `Usage: deploy-build [options]

Deploy a service build to an environment.

Options:
  -s, --service <service>     service name, e.g. customers-v1
  -e, --env <env>             env name, e.g. dev
  -b, --build-key <buildKey>  bamboo build key, e.g. API-CPV1-30
  -h, --help                  display help for command
`;
    const testCases = [
      {
        command: "deploy-build -s customers-v1 -e test -b API-3",
        expectedAction: {
          actionName: ActionName.DEPLOY_BUILD,
          service: "customers-v1",
          env: "test",
          buildKey: "API-3",
          triggeredBy: "james",
        },
      },
      {
        command: "deploy-build -scustomers-v1 -etest -bAPI-3",
        expectedAction: {
          actionName: ActionName.DEPLOY_BUILD,
          service: "customers-v1",
          env: "test",
          buildKey: "API-3",
          triggeredBy: "james",
        },
      },
      {
        command: "deploy-build -s customers-v1 -b -e test",
        error: {
          status: 400,
          message: helpMessage,
        },
      },
      {
        command: "deploy-build",
        error: {
          status: 400,
          message: helpMessage,
        },
      },
    ];
    testCases.forEach((testCase) => {
      it(testCase.command, async () => {
        try {
          const actualAction = new DeployBuildAction(testCase.command, "james");
          expect(actualAction).toEqual(testCase.expectedAction);
        } catch (err) {
          expect(err).toEqual(testCase.error);
        }
      });
    });
  });

  describe("PromoteReleaseAction", () => {
    const helpMessage = `Usage: promote-release [options]

Promote the release from one environment to another.

Options:
  -s, --service <service>        service name, e.g. customers-v1
  -se, --source-env <sourceEnv>  source environment name, e.g. dev
  -te, --target-env <targetEnv>  target environment name, e.g. test
  -h, --help                     display help for command
`;
    const testCases = [
      {
        command: "promote-release -s customers-v1 -se test -te uat",
        expectedAction: {
          actionName: ActionName.PROMOTE_RELEASE,
          service: "customers-v1",
          sourceEnv: "test",
          targetEnv: "uat",
          triggeredBy: "james",
        },
      },
      {
        command: "promote-release -scustomers-v1 -se test -te uat",
        expectedAction: {
          actionName: ActionName.PROMOTE_RELEASE,
          service: "customers-v1",
          sourceEnv: "test",
          targetEnv: "uat",
          triggeredBy: "james",
        },
      },
      {
        command: "promote-release -s customers-v1",
        error: {
          status: 400,
          message: helpMessage,
        },
      },
      {
        command: "promote-release",
        error: {
          status: 400,
          message: helpMessage,
        },
      },
    ];
    testCases.forEach((testCase) => {
      it(testCase.command, async () => {
        try {
          const actualAction = new PromoteReleaseAction(
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
});

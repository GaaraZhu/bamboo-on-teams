import { InvalidArgumentError } from "commander";
import { TeamsUser } from "../../models/teams";
import { getConfig } from "../../services/config";
import {
  Build,
  getBuild,
  getLatestBuild,
} from "../../services/executors/descBuildExecutor";
import {
  Deploy,
  getDeploy,
} from "../../services/executors/listDeploysExecutor";
import {
  sendBuildNotification,
  sendDeployBuildNotification,
  sendDeployReleaseNotification,
  sendHangingStatusNotification,
} from "../../services/notificationService";
import { isEmpty } from "../../utils";

export class JobNotFinished extends Error {
  constructor() {
    super();
    this.name = "jobNotFinished";
  }
}

export enum CheckerInputType {
  BUILD,
  NEW_BRANCH_BUILD,
  DEPLOY_BUILD,
  DEPLOY_RELEASE,
}

export interface NewBranchBuildJobCheckerInput {
  type: CheckerInputType;
  branchName: string;
  branchKey: string;
  service: string;
  triggeredBy: TeamsUser;
}

export interface BuildJobCheckerInput {
  type: CheckerInputType;
  resultKey: string;
  resultUrl: string;
  service: string;
  branch: string;
  buildNumber: string;
  triggeredBy: TeamsUser;
}

export interface DeployBuildJobCheckerInput {
  type: CheckerInputType;
  resultKey: string;
  resultUrl: string;
  service: string;
  branch: string;
  buildNumber: string;
  environment: string;
  triggeredBy: TeamsUser;
}

export interface DeployReleaseJobCheckerInput {
  type: CheckerInputType;
  resultKey: string;
  resultUrl: string;
  service: string;
  release: string;
  environment: string;
  triggeredBy: TeamsUser;
}

export const checkJobStatus = async (
  event:
    | BuildJobCheckerInput
    | NewBranchBuildJobCheckerInput
    | DeployBuildJobCheckerInput
    | DeployReleaseJobCheckerInput,
  context: any
): Promise<any> => {
  console.log(`checking job status: ${JSON.stringify(event)}`);
  switch (event.type) {
    case CheckerInputType.BUILD:
    case CheckerInputType.NEW_BRANCH_BUILD: {
      const build =
        event.type === CheckerInputType.BUILD
          ? await getBuild((event as BuildJobCheckerInput).resultKey)
          : await getLatestBuild(
              (event as NewBranchBuildJobCheckerInput).branchKey
            );
      checkBuildStatus(build);
      return build;
    }

    case CheckerInputType.DEPLOY_BUILD:
    case CheckerInputType.DEPLOY_RELEASE: {
      const deploy = await getDeploy(
        (event as DeployBuildJobCheckerInput).resultKey
      ); // both structs has the resultKey property
      checkDeployStatus(deploy);
      return deploy;
    }

    default:
      return undefined;
  }
};

export const checkBuildStatus = (build: Build | undefined): void => {
  if (
    !build || // for cases where a build has not been triggered yet after the new branch plan is created
    !["FINISHED", "NOTBUILT"].includes(build?.lifeCycleState?.toUpperCase())
  ) {
    throw new JobNotFinished();
  }
};

export const checkDeployStatus = (deploy: Deploy): void => {
  if ("FINISHED" !== deploy.lifeCycleState.toUpperCase()) {
    throw new JobNotFinished();
  }
};

export const notifyJobStatus = async (
  event: any,
  context: any
): Promise<void> => {
  console.log(`notifying job status: ${JSON.stringify(event)}`);
  const jobUrl = getJobPageUrl(
    event.resultKey || event.result.key,
    [CheckerInputType.BUILD, CheckerInputType.NEW_BRANCH_BUILD].includes(
      event.type
    )
  );
  if (event.error) {
    await sendHangingStatusNotification(
      event.service,
      event.triggeredBy,
      jobUrl
    );
    return;
  }

  switch (event.type) {
    case CheckerInputType.BUILD:
    case CheckerInputType.NEW_BRANCH_BUILD: {
      const build = event.result as Build;
      await sendBuildNotification(
        event.service,
        build.branch.name,
        build.buildState,
        event.triggeredBy,
        jobUrl
      );
      break;
    }
    case CheckerInputType.DEPLOY_BUILD: {
      const deployEvent = event as DeployBuildJobCheckerInput;
      const deploy = event.result as Deploy;
      await sendDeployBuildNotification(
        deployEvent.service,
        deployEvent.environment,
        deploy.deploymentState,
        deployEvent.triggeredBy,
        jobUrl
      );
      break;
    }
    case CheckerInputType.DEPLOY_RELEASE: {
      await sendDeployReleaseNotification(
        event.result as Deploy,
        event.service,
        event.environment,
        event.triggeredBy,
        jobUrl
      );
      break;
    }
  }
};

export const getJobPageUrl = (resultKey: string, isBuild: boolean): string => {
  if (isEmpty(resultKey)) {
    throw new InvalidArgumentError("empty resultKey");
  }
  return isBuild
    ? `https://${getConfig().bambooHostUrl}/browse/${resultKey}`
    : `https://${
        getConfig().bambooHostUrl
      }/deploy/viewDeploymentResult.action?deploymentResultId=${resultKey}`;
};

import { InvalidArgumentError } from "commander";
import { axiosPost } from "../../services/axiosService";
import {
  Build,
  getBuild,
  getLatestBuild,
} from "../../services/executors/descBuildExecutor";
import {
  Deploy,
  getDeploy,
} from "../../services/executors/listDeploysExecutor";
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
  triggeredBy: string;
}

export interface BuildJobCheckerInput {
  type: CheckerInputType;
  resultKey: string;
  resultUrl: string;
  service: string;
  branch: string;
  buildNumber: string;
  triggeredBy: string;
}

export interface DeployBuildJobCheckerInput {
  type: CheckerInputType;
  resultKey: string;
  resultUrl: string;
  service: string;
  branch: string;
  buildNumber: string;
  environment: string;
  triggeredBy: string;
}

export interface DeployReleaseJobCheckerInput {
  type: CheckerInputType;
  resultKey: string;
  resultUrl: string;
  service: string;
  release: string;
  environment: string;
  triggeredBy: string;
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
      if (
        !["FINISHED", "NOTBUILT"].includes(build?.lifeCycleState?.toUpperCase())
      ) {
        throw new JobNotFinished();
      }
      return build;
    }

    case CheckerInputType.DEPLOY_BUILD:
    case CheckerInputType.DEPLOY_RELEASE: {
      const deploy = await getDeploy(
        (event as DeployBuildJobCheckerInput).resultKey
      ); // both structs has the resultKey property
      if ("FINISHED" !== deploy.lifeCycleState.toUpperCase()) {
        throw new JobNotFinished();
      }
      return deploy;
    }

    default:
      return undefined;
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
      await sendBuildNotification(
        event.result as Build,
        event.service,
        event.triggeredBy,
        jobUrl
      );
      break;
    }
    case CheckerInputType.DEPLOY_BUILD: {
      await sendDeployBuildNotification(
        event.result as Deploy,
        event as DeployBuildJobCheckerInput,
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
    ? `https://${process.env.BAMBOO_HOST_URL}/browse/${resultKey}`
    : `https://${process.env.BAMBOO_HOST_URL}/deploy/viewDeploymentResult.action?deploymentResultId=${resultKey}`;
};

export const sendBuildNotification = async (
  build: Build,
  service: string,
  triggeredBy: string,
  jobUrl: string
): Promise<void> => {
  const isSucceed = build.buildState.toUpperCase() === "SUCCESSFUL";
  const title = `Bamboo build job finished with status: <span style=${
    isSucceed ? "color:green;" : "color:red;"
  }>${build.buildState}</span>`;
  const notification = `{
      "@type": "MessageCard",
      "@context": "http://schema.org/extensions",
      "themeColor": "0076D7",
      "summary": "${title}",
      "sections": [{
          "activityTitle": "${title}",
          "activitySubtitle": "triggered by ${triggeredBy}",
          "activityImage": "https://static.thenounproject.com/png/2714806-200.png",
          "facts": [{
              "name": "Service",
              "value": "${service}"
          },{
              "name": "Branch",
              "value": "${build.branch.name}"
          }, {
            "name": "Url",
            "value": "${jobUrl}"
          }],
          "markdown": true
      }]
  }`;
  const url = process.env.TEAMS_INCOMING_WEBHOOK_URL!;
  await axiosPost(url, notification, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

const sendDeployBuildNotification = async (
  deploy: Deploy,
  event: DeployBuildJobCheckerInput,
  jobUrl: string
): Promise<void> => {
  const isSucceed = deploy.deploymentState.toUpperCase() === "SUCCESS";
  const title = `Bamboo deploy job finished with status: <span style=${
    isSucceed ? "color:green;" : "color:red;"
  }>${deploy.deploymentState}</span>`;
  const notification = `{
      "@type": "MessageCard",
      "@context": "http://schema.org/extensions",
      "themeColor": "0076D7",
      "summary": "${title}",
      "sections": [{
          "activityTitle": "${title}",
          "activitySubtitle": "triggered by ${event.triggeredBy}",
          "activityImage": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCOVOR5MOpUL9zfdnwsdduHKAEWtmwFG5PNpt5r442D6QMbVjmjm25n8_f_uRhl0kFWLg",
          "facts": [{
              "name": "Service",
              "value": "${event.service}"
          },{
              "name": "Environment",
              "value": "${event.environment}"
          }, {
            "name": "Url",
            "value": "${jobUrl}"
          }],
          "markdown": true
      }]
  }`;
  const url = process.env.TEAMS_INCOMING_WEBHOOK_URL!;
  await axiosPost(url, notification, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const sendDeployReleaseNotification = async (
  deploy: Deploy,
  service: string,
  environment: string,
  triggeredBy: string,
  jobUrl: string
): Promise<void> => {
  const isSucceed = deploy.deploymentState.toUpperCase() === "SUCCESS";
  const title = `Bamboo deploy job finished with status: <span style=${
    isSucceed ? "color:green;" : "color:red;"
  }>${deploy.deploymentState}</span>`;
  const notification = `{
      "@type": "MessageCard",
      "@context": "http://schema.org/extensions",
      "themeColor": "0076D7",
      "summary": "${title}",
      "sections": [{
          "activityTitle": "${title}",
          "activitySubtitle": "triggered by ${triggeredBy}",
          "activityImage": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCOVOR5MOpUL9zfdnwsdduHKAEWtmwFG5PNpt5r442D6QMbVjmjm25n8_f_uRhl0kFWLg&usqp=CAU",
          "facts": [{
              "name": "Service",
              "value": "${service}"
          }, {
            "name": "Environment",
            "value": "${environment}"
          }, {
            "name": "Url",
            "value": "${jobUrl}"
          }],
          "markdown": true
      }]
  }`;
  const url = process.env.TEAMS_INCOMING_WEBHOOK_URL!;
  await axiosPost(url, notification, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

const sendHangingStatusNotification = async (
  service: string,
  triggered: string,
  jobUrl: string
): Promise<void> => {
  const notification = `{
      "@type": "MessageCard",
      "@context": "http://schema.org/extensions",
      "themeColor": "0076D7",
      "summary": "Bamboo job is hanging!!!",
      "sections": [{
          "activityTitle": "Bamboo job is hanging!!!",
          "activitySubtitle": "triggered by ${triggered}",
          "activityImage": "https://i.dlpng.com/static/png/6687341_preview.png",
          "facts": [{
              "name": "Service",
              "value": "${service}"
          },{
              "name": "Url",
              "value": "${jobUrl}"
          }],
          "markdown": true
      }]
  }`;
  await axiosPost(process.env.TEAMS_INCOMING_WEBHOOK_URL!, notification, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

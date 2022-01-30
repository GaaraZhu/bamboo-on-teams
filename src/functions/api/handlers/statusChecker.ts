import { InvalidArgumentError } from "commander";
import { axiosPost } from "../../services/axiosService";
import { Build, getBuild } from "../../services/executors/descBuildExecutor";
import {
  Deploy,
  getDeploy,
} from "../../services/executors/listDeploysExecutor";
import { isEmpty } from "../../utils";

export class JobHangingError extends Error {
  constructor() {
    super();
    this.name = "jobHangingError";
  }
}

export enum CheckerInputType {
  BUILD,
  DEPLOY_BUILD,
  DEPLOY_RELEASE,
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
    | DeployBuildJobCheckerInput
    | DeployReleaseJobCheckerInput,
  context: any
): Promise<any> => {
  console.log(`checking job status: ${JSON.stringify(event)}`);
  if (CheckerInputType.BUILD === event.type) {
    const build = await getBuild(event.resultKey);
    if (
      !["FINISHED", "NOTBUILT"].includes(build.lifeCycleState.toUpperCase())
    ) {
      throw new JobHangingError();
    }
    return build;
  } else if (
    [CheckerInputType.DEPLOY_BUILD, CheckerInputType.DEPLOY_RELEASE].includes(
      event.type
    )
  ) {
    const deploy = await getDeploy(event.resultKey);
    if ("FINISHED" !== deploy.lifeCycleState.toUpperCase()) {
      throw new JobHangingError();
    }
    return deploy;
  }

  return undefined;
};

export const notifyJobStatus = async (
  event: any,
  context: any
): Promise<void> => {
  console.log(`notifying job status: ${JSON.stringify(event)}`);
  const jobUrl = await getJobPageUrl(event.resultKey, CheckerInputType.BUILD === event.type);
  if (event.error) {
    await sendHangingStatusNotification(
      event.service,
      event.triggeredBy,
      jobUrl
    );
    return;
  }

  if (CheckerInputType.BUILD === event.type) {
    await sendBuildNotification(
      event.result as Build,
      event.triggeredBy,
      jobUrl
    );
  } else if (CheckerInputType.DEPLOY_BUILD === event.type) {
    await sendDeployBuildNotification(
      event.result as Deploy,
      event as DeployBuildJobCheckerInput,
      jobUrl
    );
  } else if (CheckerInputType.DEPLOY_RELEASE === event.type) {
    await sendDeployReleaseNotification(
      event.result as Deploy,
      event as DeployReleaseJobCheckerInput,
      jobUrl
    );
  }
};

export const getJobPageUrl = (resultKey: string, isBuild: boolean): string => {
  if(isEmpty(resultKey)) {
    throw new InvalidArgumentError("empty resultKey");
  }
  return isBuild? `https://${process.env.BAMBOO_HOST_URL}/browse/${resultKey}`
    : `https://${process.env.BAMBOO_HOST_URL}/deploy/viewDeploymentResult.action?deploymentResultId=${resultKey}`;
};

export const sendBuildNotification = async (
  build: Build,
  triggeredBy: string,
  jobUrl: string
): Promise<void> => {
  const isSucceed = build.buildState.toUpperCase() === "SUCCESSFUL";
  const notification = `{
      "@type": "MessageCard",
      "@context": "http://schema.org/extensions",
      "themeColor": "0076D7",
      "summary": "Bamboo build job finished",
      "sections": [{
          "activityTitle": "Bamboo build job finished",
          "activitySubtitle": "triggered by ${triggeredBy}",
          "activityImage": "https://static.thenounproject.com/png/2714806-200.png",
          "facts": [{
              "name": "Service",
              "value": "${build.service}"
          },{
              "name": "Branch",
              "value": "${build.branch.name}"
          }, {
              "name": "Build Number",
              "value": "${build.buildNumber}"
          }, {
              "name": "Build Key",
              "value": "${build.key}"
          }, {
              "name": "Build State",
              "value": "<span style=${
                isSucceed ? "color:green;" : "color:red;"
              }>${build.buildState}</span>"
          }, {
              "name": "Build Finished Time",
              "value": "${build.buildRelativeTime}"
          }, {
            "name": "Build Duration",
            "value": "${build.buildDuration}"
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
  const notification = `{
      "@type": "MessageCard",
      "@context": "http://schema.org/extensions",
      "themeColor": "0076D7",
      "summary": "Bamboo deploy job finished",
      "sections": [{
          "activityTitle": "Bamboo deploy job finished",
          "activitySubtitle": "triggered by ${event.triggeredBy}",
          "activityImage": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCOVOR5MOpUL9zfdnwsdduHKAEWtmwFG5PNpt5r442D6QMbVjmjm25n8_f_uRhl0kFWLg",
          "facts": [{
              "name": "Service",
              "value": "${event.service}"
          },{
              "name": "Environment",
              "value": "${event.environment}"
          }, {
              "name": "Branch",
              "value": "${event.branch}"
          }, {
              "name": "Deployed Build Number",
              "value": "${event.buildNumber}"
          }, {
              "name": "Deployment State",
              "value": "<span style=${
                isSucceed ? "color:green;" : "color:red;"
              }>${deploy.deploymentState}</span>"
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

const sendDeployReleaseNotification = async (
  deploy: Deploy,
  event: DeployReleaseJobCheckerInput,
  jobUrl: string
): Promise<void> => {
  const isSucceed = deploy.deploymentState.toUpperCase() === "SUCCESS";
  const notification = `{
      "@type": "MessageCard",
      "@context": "http://schema.org/extensions",
      "themeColor": "0076D7",
      "summary": "Bamboo deploy job finished",
      "sections": [{
          "activityTitle": "Bamboo deploy job finished",
          "activitySubtitle": "triggered by ${event.triggeredBy}",
          "activityImage": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCOVOR5MOpUL9zfdnwsdduHKAEWtmwFG5PNpt5r442D6QMbVjmjm25n8_f_uRhl0kFWLg&usqp=CAU",
          "facts": [{
              "name": "Service",
              "value": "${event.service}"
          },{
              "name": "Release",
              "value": "${event.release}"
          }, {
            "name": "Environment",
            "value": "${event.environment}"
          }, {
              "name": "Deployment State",
              "value": "<span style=${
                isSucceed ? "color:green;" : "color:red;"
              }>${deploy.deploymentState}</span>"
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

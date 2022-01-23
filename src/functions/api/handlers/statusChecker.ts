import { axiosPost } from "../../services/axiosService";
import { Build, getBuild } from "../../services/executors/descBuildExecutor";
import {
  Deploy,
  getDeploy,
} from "../../services/executors/listDeploysExecutor";

export class RetriableError extends Error {
  constructor() {
    super();
    this.name = "retriableError";
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
): Promise<void> => {
  console.log(`checking job status: ${JSON.stringify(event)}`);

  if (CheckerInputType.BUILD === event.type) {
    const build = await getBuild(event.resultKey);
    if (
      !["FINISHED", "NOT_BUILT"].includes(build.lifeCycleState.toUpperCase())
    ) {
      throw new RetriableError();
    }

    await sendBuildNotification(build, event as BuildJobCheckerInput);
  } else if (CheckerInputType.DEPLOY_BUILD === event.type) {
    const deploy = await getDeploy(event.resultKey);
    if ("FINISHED" !== deploy.lifeCycleState.toUpperCase()) {
      throw new RetriableError();
    }

    await sendDeployBuildNotification(
      deploy,
      event as DeployBuildJobCheckerInput
    );
  } else if (CheckerInputType.DEPLOY_RELEASE === event.type) {
    const deploy = await getDeploy(event.resultKey);
    if ("FINISHED" !== deploy.lifeCycleState.toUpperCase()) {
      throw new RetriableError();
    }

    await sendDeployReleaseNotification(
      deploy,
      event as DeployReleaseJobCheckerInput
    );
  }
};

const sendBuildNotification = async (
  build: Build,
  event: BuildJobCheckerInput
): Promise<void> => {
  const isSucceed = build.buildState.toUpperCase() === "SUCCESSFUL";
  const buildPageUrl = `https://${process.env.BAMBOO_HOST_URL}/browse/${build.key}`;
  const notification = `{
      "@type": "MessageCard",
      "@context": "http://schema.org/extensions",
      "themeColor": "0076D7",
      "summary": "Bamboo build job finished",
      "sections": [{
          "activityTitle": "Bamboo build job finished",
          "activitySubtitle": "triggered by ${event.triggeredBy}",
          "activityImage": "https://static.thenounproject.com/png/2714806-200.png",
          "facts": [{
              "name": "Service",
              "value": "${event.service}"
          },{
              "name": "Branch",
              "value": "${event.branch}"
          }, {
              "name": "Build Number",
              "value": "${build.buildNumber}"
          }, {
              "name": "Build State",
              "value": "<span style=${
                isSucceed ? "color:green;" : "color:red;"
              }>${build.buildState}</span>"
          }, {
              "name": "Build Relative Time",
              "value": "${build.buildRelativeTime}"
          }, {
            "name": "Url",
            "value": "${buildPageUrl}"
          }],
          "markdown": true
      }]
  }`;
  const url = process.env.NOTIFICATION_URL!;
  await axiosPost(url, notification, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

const sendDeployBuildNotification = async (
  deploy: Deploy,
  event: DeployBuildJobCheckerInput
): Promise<void> => {
  const isSucceed = deploy.deploymentState.toUpperCase() === "SUCCESS";
  const deploymentPageUrl = `https://${process.env.BAMBOO_HOST_URL}/deploy/viewDeploymentResult.action?deploymentResultId=${deploy.id}`;
  const notification = `{
      "@type": "MessageCard",
      "@context": "http://schema.org/extensions",
      "themeColor": "0076D7",
      "summary": "Bamboo deploy job finished",
      "sections": [{
          "activityTitle": "Bamboo deploy job finished",
          "activitySubtitle": "triggered by ${event.triggeredBy}",
          "activityImage": "https://toppng.com/uploads/preview/upload-11550726047fmvjjkr5mz.png",
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
            "value": "${deploymentPageUrl}"
          }],
          "markdown": true
      }]
  }`;
  const url = process.env.NOTIFICATION_URL!;
  await axiosPost(url, notification, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

const sendDeployReleaseNotification = async (
  deploy: Deploy,
  event: DeployReleaseJobCheckerInput
): Promise<void> => {
  const isSucceed = deploy.deploymentState.toUpperCase() === "SUCCESS";
  const deploymentPageUrl = `https://${process.env.BAMBOO_HOST_URL}/deploy/viewDeploymentResult.action?deploymentResultId=${deploy.id}`;
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
            "value": "${deploymentPageUrl}"
          }],
          "markdown": true
      }]
  }`;
  const url = process.env.NOTIFICATION_URL!;
  await axiosPost(url, notification, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

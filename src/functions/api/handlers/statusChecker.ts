import { axiosPost } from "../../services/axiosService";
import { Build, getBuild } from "../../services/executors/descBuildExecutor";
import { JobType } from "../../models/actions";
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

export interface JobCheckingInput {
  resultKey: string;
  resultUrl: string;
  service: string;
  branch: string;
  buildNumber: string;
  triggeredBy: string;
  environment?: string;
  jobType: JobType;
}

export const checkJobStatus = async (
  event: JobCheckingInput,
  context: any
): Promise<void> => {
  console.log(`checking job status: ${JSON.stringify(event)}`);

  if (JobType.BUILD === event.jobType) {
    const build = await getBuild(event.resultKey);
    if (
      !["FINISHED", "NOT_BUILT"].includes(build.lifeCycleState.toUpperCase())
    ) {
      throw new RetriableError();
    }

    await sendBuildNotification(build, event);
  } else {
    const deploy = await getDeploy(event.resultKey);
    if ("FINISHED" !== deploy.lifeCycleState.toUpperCase()) {
      throw new RetriableError();
    }

    await sendDeployNotification(deploy, event);
  }
};

const sendBuildNotification = async (
  build: Build,
  event: JobCheckingInput
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

const sendDeployNotification = async (
  deploy: Deploy,
  event: JobCheckingInput
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

import { axiosPost } from "../../utils";
import { Build, getBuild } from "../../services/executors/descBuildExecutor";

export class RetriableError extends Error {
  constructor() {
    super();
    this.name = "retriableError";
  }
}

export interface BuildJobCheckingInput {
  resultKey: string;
  service: string;
  branch: string;
  triggeredBy: string;
}

export const checkJobStatus = async (
  event: any,
  context: any
): Promise<void> => {
  console.log(`checking build job status: ${JSON.stringify(event)}`);

  const build = await getBuild(event.resultKey);
  if (!["FINISHED", "NOT_BUILT"].includes(build.lifeCycleState.toUpperCase())) {
    throw new RetriableError();
  }

  await sendBuildNotification(build, event as BuildJobCheckingInput);
};

const sendBuildNotification = async (
  build: Build,
  event: BuildJobCheckingInput
): Promise<void> => {
  const BUILD_NOTIFICATION = `{
        "@type": "MessageCard",
        "@context": "http://schema.org/extensions",
        "themeColor": "0076D7",
        "summary": "Service ${event.service} built successfully",
        "sections": [{
            "activityTitle": "Service ${event.service} built successfully",
            "activitySubtitle": "triggered by ${event.triggeredBy}",
            "activityImage": "https://teamsnodesample.azurewebsites.net/static/img/image5.png",
            "facts": [{
                "name": "Number",
                "value": "${build.buildNumber}"
            }, {
                "name": "Branch",
                "value": "${event.branch}"
            }, {
                "name": "Job State",
                "value": "${build.lifeCycleState}"
            }, {
                "name": "Build State",
                "value": "${build.buildState}"
            }, {
                "name": "Build Relative Time",
                "value": "${build.buildRelativeTime}"
            }, {
              "name": "Url",
              "value": "${build.url}"
            }],
            "markdown": true
        }]
    }`;
  const url = process.env.NOTIFICATION_URL!;
  await axiosPost(url, BUILD_NOTIFICATION, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

import { TeamsUser } from "../models/teams";
import { axiosPost } from "./axiosService";
import { getConfig } from "./config";
import { Deploy } from "./executors/listDeploysExecutor";

export const sendBuildNotification = async (
  service: string,
  branch: string,
  status: string,
  triggeredBy: TeamsUser,
  jobUrl?: string,
  errorMessage?: string
): Promise<void> => {
  const isSucceed = status.toUpperCase() === "SUCCESSFUL" && !errorMessage;
  const title = `Bamboo build job finished with status: <span style=${
    isSucceed ? "color:green;" : "color:red;"
  }>${status}</span>`;
  let sectionFacts = `
      {
          "name": "Service",
          "value": "${service}"
      },{
          "name": "Branch",
          "value": "${branch}"
      }
    `;
  if (jobUrl) {
    sectionFacts =
      sectionFacts +
      `, {
          "name": "Url",
          "value": "${jobUrl}"
        }`;
  }
  if (errorMessage) {
    sectionFacts =
      sectionFacts +
      `, {
        "name": "Error",
        "value": "${errorMessage}"
      }`;
  }
  const notification = `{
        "@type": "MessageCard",
        "@context": "http://schema.org/extensions",
        "themeColor": "0076D7",
        "summary": "${title}",
        "sections": [{
            "activityTitle": "${title}",
            "activitySubtitle": "triggered by ${triggeredBy.name}",
            "activityImage": "https://static.thenounproject.com/png/2714806-200.png",
            "facts": [${sectionFacts}],
            "markdown": true
        }]
    }`;
  const url = getConfig().notificationURL;
  await axiosPost(url, notification, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const sendDeployBuildNotification = async (
  service: string,
  environment: string,
  deploymentState: string,
  triggeredBy: TeamsUser,
  jobUrl?: string,
  errorMessage?: string
): Promise<void> => {
  const isSucceed =
    deploymentState.toUpperCase() === "SUCCESS" && !errorMessage;
  const title = `Bamboo deploy job finished with status: <span style=${
    isSucceed ? "color:green;" : "color:red;"
  }>${deploymentState}</span>`;
  let sectionFacts = `{
          "name": "Service",
          "value": "${service}"
      }, {
          "name": "Environment",
          "value": "${environment}"
      }`;
  if (jobUrl) {
    sectionFacts =
      sectionFacts +
      `, {
          "name": "Url",
          "value": "${jobUrl}"
        }`;
  }
  if (errorMessage) {
    sectionFacts =
      sectionFacts +
      `, {
        "name": "Error",
        "value": "${errorMessage}"
      }`;
  }
  const notification = `{
        "@type": "MessageCard",
        "@context": "http://schema.org/extensions",
        "themeColor": "0076D7",
        "summary": "${title}",
        "sections": [{
            "activityTitle": "${title}",
            "activitySubtitle": "triggered by ${triggeredBy.name}",
            "activityImage": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCOVOR5MOpUL9zfdnwsdduHKAEWtmwFG5PNpt5r442D6QMbVjmjm25n8_f_uRhl0kFWLg",
            "facts": [${sectionFacts}],
            "markdown": true
        }]
    }`;
  const url = getConfig().notificationURL;
  await axiosPost(url, notification, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export interface BatchNotificationInput {
  services: {
    service: string;
    status: string;
  }[];
  branch: string;
  environment?: string;
  triggeredBy: TeamsUser;
}

export const sendAllBuildsNotification = async (
  input: BatchNotificationInput,
  messageTitle?: string
): Promise<void> => {
  if (input.services.length == 0) {
    return;
  }

  const title = `${messageTitle || "Bamboo batch build job finished"}`;
  const sectionFacts = generateSectionFacts(input);
  const notification = `{
        "@type": "MessageCard",
        "@context": "http://schema.org/extensions",
        "themeColor": "0076D7",
        "summary": "${title}",
        "sections": [{
            "activityTitle": "${title}",
            "activitySubtitle": "triggered by ${input.triggeredBy.name}",
            "activityImage": "https://static.thenounproject.com/png/2714806-200.png",
            "facts": [${sectionFacts}],
            "markdown": true
        }]
    }`;
  const url = getConfig().notificationURL;
  await axiosPost(url, notification, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const sendAllDeploysNotification = async (
  input: BatchNotificationInput,
  messageTitle?: string
): Promise<void> => {
  if (input.services.length == 0) {
    return;
  }

  const title = `${messageTitle || "Bamboo batch deploy job finished"} in ${
    input.environment
  }`;
  const sectionFacts = generateSectionFacts(input);
  const notification = `{
        "@type": "MessageCard",
        "@context": "http://schema.org/extensions",
        "themeColor": "0076D7",
        "summary": "${title}",
        "sections": [{
            "activityTitle": "${title}",
            "activitySubtitle": "triggered by ${input.triggeredBy.name}",
            "activityImage": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCOVOR5MOpUL9zfdnwsdduHKAEWtmwFG5PNpt5r442D6QMbVjmjm25n8_f_uRhl0kFWLg",
            "facts": [${sectionFacts}],
            "markdown": true
        }]
    }`;
  const url = getConfig().notificationURL;
  await axiosPost(url, notification, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

const generateSectionFacts = (input: BatchNotificationInput): string => {
  let sectionFacts = "";
  input.services.forEach((service) => {
    const isSucceed = ["SUCCESS", "SUCCESSFUL"].includes(
      service.status.toUpperCase()
    );
    const status = `<span style=${isSucceed ? "color:green;" : "color:red;"}>${
      service.status.toUpperCase()
    }</span>`;
    sectionFacts =
      sectionFacts +
      `{
          "name": "${service.service}",
          "value": "${status}"
      },`;
  });
  return sectionFacts.substring(0, sectionFacts.length - 1);
};

export const sendReleaseFailedNotification = async (
  errorMessage: string,
  environment: string,
  triggeredBy: TeamsUser
): Promise<void> => {
  const title = `Bamboo release job <span style='color:red;'>FAILED</span> in ${environment}`;
  const notification = `{
        "@type": "MessageCard",
        "@context": "http://schema.org/extensions",
        "themeColor": "0076D7",
        "summary": "${title}",
        "sections": [{
            "activityTitle": "${title}",
            "activitySubtitle": "triggered by ${triggeredBy.name}",
            "activityImage": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCOVOR5MOpUL9zfdnwsdduHKAEWtmwFG5PNpt5r442D6QMbVjmjm25n8_f_uRhl0kFWLg",
            "facts": [{
              "name": "error",
              "value": "${errorMessage}"
          }],
            "markdown": true
        }]
    }`;
  const url = getConfig().notificationURL;
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
  triggeredBy: TeamsUser,
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
            "activitySubtitle": "triggered by ${triggeredBy.name}",
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
  const url = getConfig().notificationURL;
  await axiosPost(url, notification, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const sendHangingStatusNotification = async (
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
  await axiosPost(getConfig().notificationURL, notification, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

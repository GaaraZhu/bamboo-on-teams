import { Request, Response } from "lambda-api";
import { CommandParser } from "../../services/commandParser";
import { getBuild } from "../../services/executors/descBuildExecutor";
import { getDeploymentProjectById } from "../../services/executors/listDeploymentProjectsExecutor";
import { getDeploy } from "../../services/executors/listDeploysExecutor";
import { getJobPageUrl, sendBuildNotification, sendDeployReleaseNotification } from "./statusChecker";

export const handleCommand = async (
  request: Request,
  response: Response
): Promise<void> => {
  const body: IncomingMessage = request.body;
  console.log(
    `Action: ${body.text} triggered by user ${body.from.name} from channel ${body.channelId}`
  );
  try {
    const action = await CommandParser.build().parse(body.text, body.from.name);
    const result = await action.process();
    response.status(200).json(result);
  } catch (err: any) {
    console.log(
      `Failed to execute ACTION ${body.text} due to ${JSON.stringify(err)}`
    );
    response.status(err.status || 500).json(err.message);
  }
  console.log(`Action: ${body.text} finished`);
};

interface IncomingMessage {
  channelId: string;
  from: {
    id: string;
    name: string;
  };
  text: string;
}

export const handleNotification = async (
  request: Request,
  response: Response
): Promise<void> => {
  if (!request.requestContext?.identity?.sourceIp
    || (process.env.NOTIFICATION_API_WHITELIST_IPS
      && !process.env.NOTIFICATION_API_WHITELIST_IPS.includes(request.requestContext.identity.sourceIp))) {
    response.status(403).json({message: "Forbidden"});
    return;
  }

  try {
    const body = request.body;
    if (body.build) {
      const buildNotification = body.build as BambooBuildNotification;
      const build = await getBuild(buildNotification.buildResultKey);
      await sendBuildNotification(build, getTriggeredByFromBambooRequest(buildNotification.triggerSentence), getJobPageUrl(build.key, true));
    } else if (body.deployment) {
      const notification = body.deployment as BambooDeploymentNotification;
      const deployProject = await getDeploymentProjectById(notification.deploymentProjectId);
      const deploy = await getDeploy(notification.deploymentResultId);
      await sendDeployReleaseNotification(deploy, deployProject.name, notification.environmentName, getTriggeredByFromBambooRequest(notification.triggerSentence), getJobPageUrl(notification.deploymentResultId, false));
    }
    response.status(200).json({});
  } catch (err: any) {
    console.log(
      `Failed to execute notification request due to ${JSON.stringify(err)}`
    );
    response.status(500).json(err.message);
  }
};

interface BambooBuildNotification {
  buildResultKey: string,
  triggerSentence?: string,
}

interface BambooDeploymentNotification {
  deploymentResultId: string,
  deploymentProjectId: string,
  environmentName: string,
  triggerSentence?: string,
}

const getTriggeredByFromBambooRequest = (triggerSentence: string | undefined): string => {
  let triggeredBy = "Bamboo";
  if(triggerSentence && triggerSentence.includes("triggered by ")) {
    triggeredBy = triggerSentence.split("triggered by ")[1];
  }

  return triggeredBy;
}
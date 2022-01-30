import { Request, Response } from "lambda-api";
import { CommandParser } from "../../services/commandParser";
import { getBuild } from "../../services/executors/descBuildExecutor";
import { getJobPageUrl, sendBuildNotification } from "./statusChecker";

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
  if (process.env.NOTIFICATION_API_WHITELIST_DOMAIN && process.env.NOTIFICATION_API_WHITELIST_DOMAIN !== request.requestContext?.domainName) {
    response.status(403).json({message: "Forbidden"});
    return;
  }

  try {
    const body = request.body;
    if (body.build) {
      const buildNotification = body.build as BambooBuildNotification;
      const build = await getBuild(buildNotification.buildResultKey);
      const jobUrl = getJobPageUrl(build.key, true);

      await sendBuildNotification(build, getTriggeredByFromBambooRequest(buildNotification.triggerSentence), jobUrl);
      response.status(200).json({});
    }
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

const getTriggeredByFromBambooRequest = (triggerSentence: string | undefined): string => {
  let triggeredBy = "Bamboo";
  if(triggerSentence && triggerSentence.includes("triggered by ")) {
    triggeredBy = triggerSentence.split("triggered by ")[1];
  }

  return triggeredBy;
}
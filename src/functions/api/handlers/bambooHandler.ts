import { ACM } from "aws-sdk";
import { Request, Response } from "lambda-api";
import { ActionName } from "../../models/actions";
import { CommandParser } from "../../services/commandParser";
import { extractCommandFromTeamsMessage } from "../../utils";

export const handleCommand = async (
  request: Request,
  response: Response
): Promise<void> => {
  const body: IncomingMessage = request.body;
  console.log(
    `Action: ${body.text} triggered by user ${body.from.name} from channel ${body.channelId}`
  );
  const command = extractCommandFromTeamsMessage(body.text);
  try {
    const action = await CommandParser.build().parse(command, body.from.name);
    const result = await action.process();

    let resultMessage =
      "Job has been triggered, please wait for the result notification.";
    if (ActionName.HELP === action.actionName) {
      resultMessage = result;
    } else if (
      ![
        ActionName.BUILD,
        ActionName.CREATE_BRANCH,
        ActionName.DEPLOY_BUILD,
        ActionName.DEPLOY_LATEST_BUILD,
        ActionName.DEPLOY_RELEASE,
        ActionName.PROMOTE_RELEASE,
      ].includes(action.actionName)
    ) {
      resultMessage = JSON.stringify(result);
    }

    const responseMsg = JSON.stringify({
      type: "message",
      text: resultMessage,
    });

    console.log(responseMsg);
    response.status(200).send(responseMsg);
  } catch (err: any) {
    console.log(
      `Failed to execute ACTION ${command} due to ${JSON.stringify(err)}`
    );
    const responseMsg = JSON.stringify({
      type: "message",
      text: err.message,
    });
    response.status(200).send(responseMsg);
  }
  console.log(`Action: ${command} finished`);
};

interface IncomingMessage {
  channelId: string;
  from: {
    id: string;
    name: string;
  };
  text: string;
}

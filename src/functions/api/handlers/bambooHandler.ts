import { Request, Response } from "lambda-api";
import { ActionName } from "../../models/actions";
import { IncomingMessage } from "../../models/teams";
import { CommandParser } from "../../services/commandParser";
import { extractCommandFromTeamsMessage, fallbackToHTML } from "../../utils";

export const handleCommand = async (
  request: Request,
  response: Response
): Promise<void> => {
  const body: IncomingMessage = request.body;
  console.log(
    `Action: [${body.text}] triggered by user ${body.from.name}, id ${body.from.id} from channel ${body.channelId}`
  );
  const command = extractCommandFromTeamsMessage(body.text);
  let resultMessage =
    "Job has been triggered, please wait for the result notification.";
  try {
    const action = await CommandParser.build().parse(command, body.from);
    const result = await action.process();

    if (ActionName.CREATE_BRANCH === action.actionName) {
      resultMessage =
        "Branch plan has been created and a build job has been triggered, please wait for the result notification.";
    } else if (ActionName.HELP === action.actionName) {
      resultMessage = result;
    } else if (
      ![
        ActionName.BUILD,
        ActionName.BUILD_AND_DEPLOY,
        ActionName.DEPLOY_BUILD,
        ActionName.DEPLOY,
        ActionName.DEPLOY_RELEASE,
        ActionName.BATCH_DEPLOY,
        ActionName.BATCH_BUILD,
        ActionName.BATCH_CREATE_BRANCH,
        ActionName.PROMOTE_DEPLOY,
        ActionName.PROMOTE_RELEASE,
        ActionName.RELEASE,
      ].includes(action.actionName)
    ) {
      /* eslint-disable */resultMessage = fallbackToHTML(JSON.stringify(result, null, "\t")); // fall back json to HTML for better display
    } else {
      console.log(`Command result: ${JSON.stringify(result)}`);
    }
  } catch (err: any) {
    console.log(
      `Failed to execute ACTION ${command} due to ${JSON.stringify(err)}`
    );
    resultMessage = fallbackToHTML(err.message); // fall back error messge to HTML for better display
  }

  const responseMsg = {
    type: "message",
    text: `${resultMessage}`
  };
  console.log(
    `Responding to Teams channel: ${responseMsg}`
  );
  response.status(200).json(responseMsg);
};

import { Response } from "lambda-api";
import { HelpAction } from "../../models/helpAction";
import { ActionName } from "../../models/actions";

export const executeHelpCommand = async (
  action: HelpAction,
  response: Response
): Promise<void> => {
  const help = `
  <div>
    <div>NAME</div>
    <div>Bamboo-On-Teams</div>
    <br/>
    <div>DESCRIPTION</div>
    <div>A serverless ChatOps tool for interacting with Bamboo from Microsoft Teams.</div>
    <br/>
    <div>SYNOPSIS</div>
    <div>&lt;command&gt; [options]</div>
    <div>Use "&lt;command&gt; help" for information on a specific command. The synopsis for each command shows its options and their usage.</div>
    <div>&nbsp;</div>
    <div>
    <div>
    <div>AVAILABLE COMMANDS</div>
    <div>* ${Object.values(ActionName).join("</div><div>* ")}</div>
    <div>&nbsp;</div>
    </div>
    </div>
  </div>
`;
  response.status(200).html(help);
};

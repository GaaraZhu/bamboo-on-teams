import { HelpAction } from "../../models/helpAction";
import { actionGroupLookup, ActionName, JobType } from "../../models/actions";

export const executeHelpCommand = async (action: HelpAction): Promise<any> => {
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
    <div>1. Build commands</div>
    <div>* ${actionGroupLookup[JobType.BUILD].join("</div><div>* ")}</div>
    <div>&nbsp;</div>
    <div>2. Deploy commands</div>
    <div>* ${actionGroupLookup[JobType.Deploy].join("</div><div>* ")}</div>
    <div>&nbsp;</div>
    <div>3. Other commands</div>
    <div>* ${actionGroupLookup[JobType.OTHERS].join("</div><div>* ")}</div>
    <div>&nbsp;</div>
    </div>
    </div>
  </div>
`;
  return help;
};

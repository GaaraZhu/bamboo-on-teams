import { HelpAction } from "../../models/helpAction";
import { actionGroupLookup, ActionName, JobType } from "../../models/actions";

export const executeHelpCommand = async (action: HelpAction): Promise<any> => {
  const help = `NAME
Bamboo-On-Teams

DESCRIPTION
A serverless ChatOps tool for interacting with Bamboo from Microsoft Teams.

SYNOPSIS
&lt;command&gt; [options]
Use "&lt;command&gt; help" for information on a specific command. The synopsis for each command shows its options and their usage.

AVAILABLE COMMANDS
1. Build commands
* ${actionGroupLookup[JobType.BUILD].join("* ")}

2. Deploy commands
* ${actionGroupLookup[JobType.Deploy].join("* ")}

3. Other commands
* ${actionGroupLookup[JobType.OTHERS].join("* ")}

`;
  return help;
};

import { HelpAction } from "../../models/helpAction";
import { actionGroupLookup, JobType } from "../../models/actions";

export const executeHelpCommand = async (action: HelpAction): Promise<any> => {
  return `<b>NAME</b><br/>Bamboo-On-Teams<br/><br/><b>DESCRIPTION</b><br/>A serverless ChatOps tool for interacting with Bamboo from Microsoft Teams.<br/><br/><b>SYNOPSIS</b><br/>&lt;command&gt; [options]<br/>Use "&lt;command&gt; help" for information on a specific command. The synopsis for each command shows its options and their usage.<br/><br/><b>AVAILABLE COMMANDS</b><br/>1. Build commands<br/>* ${actionGroupLookup[
    JobType.BUILD
  ].join("<br/>* ")}<br/><br/>2. Deploy commands<br/>* ${actionGroupLookup[
    JobType.Deploy
  ].join("<br/>* ")}<br/><br/>3. Other commands<br/>* ${actionGroupLookup[
    JobType.OTHERS
  ].join("<br/>* ")}<br/>`;
};

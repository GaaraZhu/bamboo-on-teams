import { HelpAction } from "../../../src/functions/models/helpAction";
import { executeHelpCommand } from "../../../src/functions/services/executors/helpExecutor";

describe("helpExecutor", () => {
  it("help text", async () => {
    /* eslint-disable */
    const expected =
      `<b>NAME</b><br/>Bamboo-On-Teams<br/><br/><b>DESCRIPTION</b><br/>A serverless ChatOps tool for interacting with Bamboo from Microsoft Teams.<br/><br/><b>SYNOPSIS</b><br/>&lt;command&gt; [options]<br/>Use "&lt;command&gt; help" for information on a specific command. The synopsis for each command shows its options and their usage.<br/><br/><b>AVAILABLE COMMANDS</b><br/>1. Build commands<br/>* list-plans<br/>* list-branches<br/>* list-builds<br/>* desc-build<br/>* build<br/>* batch-build<br/>* create-branch<br/><br/>2. Deploy commands<br/>* list-projects<br/>* list-envs<br/>* list-releases<br/>* list-deploys<br/>* create-release<br/>* build-and-deploy<br/>* deploy<br/>* deploy-release<br/>* deploy-build<br/>* batch-deploy<br/>* release<br/>* promote-deploy<br/>* promote-release<br/><br/>3. Other commands<br/>* help<br/>`;
    expect(expected).toEqual(
      await executeHelpCommand(
        new HelpAction("help", {
          id: "1sdjckoli12",
          name: "james",
        })
      )
    );
  });
});

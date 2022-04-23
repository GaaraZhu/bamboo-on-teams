import { HelpAction } from "../../../src/functions/models/helpAction";
import { executeHelpCommand } from "../../../src/functions/services/executors/helpExecutor";

describe("helpExecutor", () => {
  it("help text", async () => {
    console.log(
      await executeHelpCommand(
        new HelpAction("help", {
          id: "1sdjckoli12",
          name: "james",
        })
      )
    );
  });
});

import { ActionName } from "../../src/functions/models/actions";
import { CommandParser } from "../../src/functions/services/commandParser";

describe("parseCommand", () => {
  const testCases = [
    {
      input: {
        command: "build -s customers-v1 -b master",
        triggeredBy: "james",
      },
      action: {
        actionName: ActionName.BUILD,
        service: "customers-v1",
        branch: "master",
        triggeredBy: "james",
      },
    },
    {
      input: {
        command: "build -s customers-v1 -b master",
        triggeredBy: "james",
      },
      action: {
        actionName: ActionName.BUILD,
        service: "customers-v1",
        branch: "master",
        triggeredBy: "james",
      },
    },
  ];

  testCases.forEach((testCase) => {
    it("Input: " + testCase.input.command, async () => {
      const action = await CommandParser.build().parse(
        testCase.input.command,
        testCase.input.triggeredBy
      );
      expect(action).toEqual(testCase.action);
    });
  });
});

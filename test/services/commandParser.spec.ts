import { ActionName } from "../../src/functions/models/actions";
import { TeamsUser } from "../../src/functions/models/teams";
import { CommandParser } from "../../src/functions/services/commandParser";

const user: TeamsUser = {
  id: "1sdjckoli12",
  name: "james",
};

describe("parseCommand", () => {
  const testCases = [
    {
      input: {
        command: "build -s customers-v1 -b master",
        triggeredBy: user,
      },
      action: {
        actionName: ActionName.BUILD,
        service: "customers-v1",
        branch: "master",
        triggeredBy: user,
      },
    },
    {
      input: {
        command: "build -s customers-v1 -b master",
        triggeredBy: user,
      },
      action: {
        actionName: ActionName.BUILD,
        service: "customers-v1",
        branch: "master",
        triggeredBy: user,
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

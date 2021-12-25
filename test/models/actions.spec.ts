import {
  ActionNames,
  BuildAction,
} from "../../src/functions/api/models/actions";

describe("actions", () => {
  describe("BuildAction", () => {
    it("build action correctly", async () => {
      const testCases = [
        {
          command: "build -service=customer-service -branch=master",
          expectedAction: {
            action: ActionNames.BUILD,
            service: "customer-service",
            branch: "master",
          },
        },
        {
          command: "build --service=customer-service -branch=master",
          expectedAction: {
            action: ActionNames.BUILD,
            service: "customer-service",
            branch: "master",
          },
        },
        {
          command: "build --service=customer-service --branch=master",
          expectedAction: {
            action: ActionNames.BUILD,
            service: "customer-service",
            branch: "master",
          },
        },
        {
          command: "build -branch=master -service=customer-service",
          expectedAction: {
            action: ActionNames.BUILD,
            service: "customer-service",
            branch: "master",
          },
        },
        {
          command: "build -branch=master -service=customer-service -plan=test",
          expectedAction: {
            action: ActionNames.BUILD,
            service: "customer-service",
            branch: "master",
          },
        },
        {
          command: "build -service=customer-service",
          error: {
            message: "Usage: build -service=[service] -branch=[branch]",
          },
        },
        {
          command: "build -branch=master",
          error: {
            message: "Usage: build -service=[service] -branch=[branch]",
          },
        },
        {
          command: "build",
          error: {
            message: "Usage: build -service=[service] -branch=[branch]",
          },
        },
      ];
      testCases.forEach((testCase) => {
        try {
          const actualAction = new BuildAction(testCase.command);
          expect(actualAction).toEqual(testCase.expectedAction);
        } catch (err) {
          expect(err).toEqual(testCase.error);
        }
      });
    });
  });
});

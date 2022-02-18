import {
  extractCommandFromTeamsMessage,
  fallbackToHTML,
  isInvalidProdEnv,
  trim,
} from "../src/functions/utils";

describe("utils", () => {
  describe("emptyCheck", () => {
    const testCases = [
      {
        input: undefined,
        errorMessage: "empty argument",
      },
      {
        input: "",
        errorMessage: "empty argument",
      },
      {
        input: " ",
        errorMessage: "empty argument",
      },
      {
        input: "master",
        output: "master",
      },
      {
        input: "master ",
        output: "master",
      },
    ];

    testCases.forEach((testCase) => {
      it("Input: " + testCase.input, async () => {
        try {
          expect(trim(testCase.input)).toEqual(testCase.output);
        } catch (err: any) {
          expect(err.message).toEqual(testCase.errorMessage);
        }
      });
    });
  });

  describe("isInvalidProdEnv check", () => {
    const testCases = [
      {
        enabledForProd: "true",
        env: "Prod",
        expected: false,
      },
      {
        enabledForProd: "true",
        env: "Production",
        expected: false,
      },
      {
        enabledForProd: "true",
        env: "Product",
        expected: false,
      },
      {
        enabledForProd: "false",
        env: "Product",
        expected: true,
      },
      {
        enabledForProd: "false",
        env: "Prod",
        expected: true,
      },
      {
        enabledForProd: "false",
        env: "Production",
        expected: true,
      },
      {
        env: "Prod",
        expected: true,
      },
      {
        env: "Production",
        expected: true,
      },
    ];

    testCases.forEach((testCase) => {
      it(JSON.stringify(testCase), async () => {
        process.env.ENABLE_FOR_PROD = testCase.enabledForProd;
        expect(isInvalidProdEnv(testCase.env)).toEqual(testCase.expected);
      });
    });
  });

  describe("extractCommandFromTeamsMessage", () => {
    const testCases = [
      {
        command: "<at>Bamboo</at>&nbsp;build -s core-customers-v1 -b master ",
        expected: "build -s core-customers-v1 -b master",
      },
      {
        command:
          "<at>Bamboo-on-teams</at>&nbsp; build -s core-customers-v1 -b master ",
        expected: "build -s core-customers-v1 -b master",
      },
      {
        command:
          "<at>Bamboo-bot</at>&nbsp;&nbsp;build -s core-customers-v1 -b master ",
        expected: "build -s core-customers-v1 -b master",
      },
      {
        command: "<at>Bamboo</at>build -s core-customers-v1 -b master ",
        expected: "build -s core-customers-v1 -b master",
      },
      {
        command: "<at>Bamboo</at> build -s core-customers-v1 -b master ",
        expected: "build -s core-customers-v1 -b master",
      },
      {
        command:
          "<at>Bamboo</at>&nbsp; &nbsp;build -s core-customers-v1 -b master ",
        expected: "build -s core-customers-v1 -b master",
      },
      {
        command:
          "<at>Bamboo</at>&nbsp; &nbsp;build -s core-customers-v1&nbsp; -b master ",
        expected: "build -s core-customers-v1  -b master",
      },
    ];

    testCases.forEach((testCase) => {
      it(testCase.command, async () => {
        expect(extractCommandFromTeamsMessage(testCase.command)).toEqual(
          testCase.expected
        );
      });
    });
  });

  describe("fallbackToHTML", () => {
    const testCases = [
      {
        name: "json message",
        message:
          '[\n\t{\n\t\t"key": "API-PCV25-3",\n\t\t"lifeCycleState": "Finished",\n\t\t"buildState": "Successful",\n\t\t"buildRelativeTime": "1 day ago"\n\t},\n\t{\n\t\t"key": "API-PCV25-2",\n\t\t"lifeCycleState": "Finished",\n\t\t"buildState": "Successful",\n\t\t"buildRelativeTime": "3 days ago"\n\t},\n\t{\n\t\t"key": "API-PCV25-1",\n\t\t"lifeCycleState": "Finished",\n\t\t"buildState": "Failed",\n\t\t"buildRelativeTime": "3 days ago"\n\t}\n]',
        expected:
          '[<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"key": "API-PCV25-3",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"lifeCycleState": "Finished",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"buildState": "Successful",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"buildRelativeTime": "1 day ago"<br>&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"key": "API-PCV25-2",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"lifeCycleState": "Finished",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"buildState": "Successful",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"buildRelativeTime": "3 days ago"<br>&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"key": "API-PCV25-1",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"lifeCycleState": "Finished",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"buildState": "Failed",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"buildRelativeTime": "3 days ago"<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>]',
      },
      {
        name: "text message",
        message: `Usage: desc-build [options]

Describe a build.

Options:
  -b, --build <build>  build key, e.g. API-CCV28-1
  -h, --help           display help for command`,
        expected:
          "Usage: desc-build [options]<br><br>Describe a build.<br><br>Options:<br>  -b, --build <build>  build key, e.g. API-CCV28-1<br>  -h, --help           display help for command",
      },
    ];

    testCases.forEach((testCase) => {
      it(testCase.name, async () => {
        expect(fallbackToHTML(testCase.message)).toEqual(testCase.expected);
      });
    });
  });
});

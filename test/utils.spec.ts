import {
  extractCommandFromTeamsMessage,
  fallbackToHTML,
  prodEnvCheck,
  trim,
  vcsBranchToBambooBranch,
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

  /* eslint-disable */
  describe("prodEnvCheck", () => {
    const testCases = [
      {
        env: "prod",
        config: '{"prod": {"enabled": true, "allowedUserIds": ["user123", "user234"]}}',
        currentUser: {
          id: "user123",
          name: "jerry",
        },
        errorMessage: undefined,
      },
      {
        env: "prod",
        config: '{"prod": {"enabled": true, "allowedUserIds": ["user234"]}}',
        currentUser: {
          id: "user123",
          name: "jerry",
        },
        errorMessage: "Current user is not allowed to perform this action in Production environment.",
      },
      {
        env: "prod",
        config: '{"prod": {"enabled": false}}',
        currentUser: {
          id: "user123",
          name: "jerry",
        },
        errorMessage: "Production environment is disabled.",
      },
      {
        env: "prod",
        config: "{}",
        currentUser: {
          id: "user123",
          name: "jerry",
        },
        errorMessage: "Production environment is disabled.",
      },
      {
        env: "test",
        config: '{"prod": {"enabled": true, "allowedUserIds": []}}',
        currentUser: {
          id: "user123",
          name: "jerry",
        },
        errorMessage: undefined,
      },
      {
        env: "test",
        config: '{"prod": {"enabled": false}}',
        currentUser: {
          id: "user123",
          name: "jerry",
        },
        errorMessage: undefined,
      },
      {
        env: "test",
        config: "{}",
        currentUser: {
          id: "user123",
          name: "jerry",
        },
        errorMessage: undefined,
      },
    ];

    testCases.forEach((testCase) => {
      it(`test case: ${JSON.stringify(testCase)}`, async () => {
        process.env.APPLICATION_CONFIG = testCase.config;
        try {
          expect(prodEnvCheck(testCase.env, testCase.currentUser));
        } catch (err: any) {
          expect(err.message).toEqual(testCase.errorMessage);
        }
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
          "<at>Bamboo</at>&nbsp; build -s core-customers-v1 -b master ",
        expected: "build -s core-customers-v1 -b master",
      },
      {
        command:
          "<at>Bamboo</at>&nbsp;&nbsp;build -s core-customers-v1 -b master ",
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
        expected: "build -s core-customers-v1 -b master",
      },
      {
        command:`<div itemprop="copy-paste-block">
        <div style="font-size:14px"><at>Bamboo</at> batch-deploy -s&nbsp;<at>Layered-Apis-Common-V1&nbsp;</at>-b release-broadband-r3-mvp -e test1`,
        expected: "batch-deploy -s Layered-Apis-Common-V1 -b release-broadband-r3-mvp -e test1",
      },
      {
        command:`<at>Bamboo</at>&nbsp;deploy -s digital-river-service -b develop -e&nbsp; test3`,
        expected: "deploy -s digital-river-service -b develop -e test3",
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
          /* eslint-disable */'[\n\t{\n\t\t"key": "API-PCV25-3",\n\t\t"lifeCycleState": "Finished",\n\t\t"buildState": "Successful",\n\t\t"buildRelativeTime": "1 day ago"\n\t},\n\t{\n\t\t"key": "API-PCV25-2",\n\t\t"lifeCycleState": "Finished",\n\t\t"buildState": "Successful",\n\t\t"buildRelativeTime": "3 days ago"\n\t},\n\t{\n\t\t"key": "API-PCV25-1",\n\t\t"lifeCycleState": "Finished",\n\t\t"buildState": "Failed",\n\t\t"buildRelativeTime": "3 days ago"\n\t}\n]',
        expected:
          /* eslint-disable */'[<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"key": "API-PCV25-3",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"lifeCycleState": "Finished",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"buildState": "Successful",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"buildRelativeTime": "1 day ago"<br>&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"key": "API-PCV25-2",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"lifeCycleState": "Finished",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"buildState": "Successful",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"buildRelativeTime": "3 days ago"<br>&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"key": "API-PCV25-1",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"lifeCycleState": "Finished",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"buildState": "Failed",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"buildRelativeTime": "3 days ago"<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>]',
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

describe("vcsBranchToBambooBranch", () => {
  const testCases = [
    {
      vcsBranch: "release/customer-r1",
      expectedResult: "release-customer-r1",
    },
    {
      vcsBranch: "feature/DS-1/SDFF-S",
      expectedResult: "feature-DS-1-SDFF-S",
    },
    {
      vcsBranch: "bugfix/da-dads",
      expectedResult: "bugfix-da-dads",
    },
    {
      vcsBranch: "master",
      expectedResult: "master",
    },
  ];

  testCases.forEach((testCase) => {
    it("vcsBranch: " + testCase.vcsBranch, async () => {
      expect(vcsBranchToBambooBranch(testCase.vcsBranch)).toEqual(testCase.expectedResult);
    });
  });
});
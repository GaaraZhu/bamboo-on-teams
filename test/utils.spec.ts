import { trim } from "../src/functions/utils";

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
});

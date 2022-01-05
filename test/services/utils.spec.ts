import { emptyCheck, prodEnvCheck } from "../../src/functions/utils";

describe("utils", () => {
  describe("emptyCheck", () => {
    it("undefined", async () => {
      expect(emptyCheck(undefined)).toEqual(true);
    });
    it("empty string", async () => {
      expect(emptyCheck("")).toEqual(true);
    });

    it("spaces", async () => {
      expect(emptyCheck(" ")).toEqual(true);
    });

    it("spaces", async () => {
      expect(emptyCheck("1 ")).toEqual(false);
    });
  });

  describe("prodEnvCheck", () => {
    const testCases = [
      {
        description: "prod disabled: check env prod",
        enabledForProd: "false",
        env: "prod",
        errorMessage: "Bamboo-on-teams is disabled for production environment",
      },
      {
        description: "prod disabled: check env preprod",
        enabledForProd: "FALSE",
        env: "preprod",
      },
      {
        description: "prod disabled: check env PROD",
        enabledForProd: "false",
        env: "PROD",
        errorMessage: "Bamboo-on-teams is disabled for production environment",
      },
      {
        description: "prod disabled: check env PROD",
        enabledForProd: "false",
        env: "PROD",
        errorMessage: "Bamboo-on-teams is disabled for production environment",
      },
    ];
    //TODO: run above test cases
  });
});

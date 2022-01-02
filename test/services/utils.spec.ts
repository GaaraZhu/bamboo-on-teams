import { isEmpty, prodEnvCheck } from "../../src/functions/utils";

describe("utils", () => {
  describe("isEmpty", () => {
    it("undefined", async () => {
      expect(isEmpty(undefined)).toEqual(true);
    });
    it("empty string", async () => {
      expect(isEmpty("")).toEqual(true);
    });

    it("spaces", async () => {
      expect(isEmpty(" ")).toEqual(true);
    });

    it("spaces", async () => {
      expect(isEmpty("1 ")).toEqual(false);
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

import { CommandParser } from "../../src/functions/services/commandParser";

describe("commandService", () => {
  describe("isEmpty", () => {
    it("undefined", async () => {
      expect(CommandParser.isEmpty(undefined)).toEqual(true);
    });
    it("empty string", async () => {
      expect(CommandParser.isEmpty("")).toEqual(true);
    });

    it("spaces", async () => {
      expect(CommandParser.isEmpty(" ")).toEqual(true);
    });

    it("spaces", async () => {
      expect(CommandParser.isEmpty("1 ")).toEqual(false);
    });
  });
  describe("extratArg", () => {
    it("happy case", async () => {
      expect(
        CommandParser.extractArg("plan", ["-plan=p1", "-branch=master"])
      ).toEqual("p1");
    });
    it("failure case", async () => {
      expect(
        CommandParser.extractArg("plan", ["-planKey=p1", "-branch=master"])
      ).toEqual(undefined);
    });
  });
});

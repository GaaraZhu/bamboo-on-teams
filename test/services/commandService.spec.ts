import { CommandService } from "../../src/functions/api/services/commandService";

describe("commandService", () => {
  describe("isEmpty", () => {
    it("undefined", async () => {
      expect(CommandService.isEmpty(undefined)).toEqual(true);
    });
    it("empty string", async () => {
      expect(CommandService.isEmpty("")).toEqual(true);
    });

    it("spaces", async () => {
      expect(CommandService.isEmpty(" ")).toEqual(true);
    });

    it("spaces", async () => {
      expect(CommandService.isEmpty("1 ")).toEqual(false);
    });
  });
  describe("extratArg", () => {
    it("happy case", async () => {
      expect(
        CommandService.extractArg("plan", ["-plan=p1", "-branch=master"])
      ).toEqual("p1");
    });
    it("failure case", async () => {
      expect(
        CommandService.extractArg("plan", ["-planKey=p1", "-branch=master"])
      ).toEqual(undefined);
    });
  });
});

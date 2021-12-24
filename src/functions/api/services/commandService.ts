import { Actions, BuildAction } from "../models/actions";

const usage = "Usage: build -service [service] -branch [branch]";
const isEmpty = (value: string | undefined) => {
  return !value || /^ *$/.test(value);
};

export class CommandService {
    public static build = () : CommandService => new CommandService();

    public async parse(command: string): Promise<BuildAction> {
        const actionAndArgs = command.split(" ");
        if(actionAndArgs.length<2) {
          throw {
            message: usage,
          };
        }
      
        const action = actionAndArgs[0];
        const args = actionAndArgs.slice(1);
        if (action.toUpperCase() == Actions.BUILD.toString()) {
          const service = await this.extractArg('service', args);
          const branch = await this.extractArg('branch', args);
          if (isEmpty(service) || isEmpty(branch)) {
            throw {
              message: usage,
            };
          }
          return new BuildAction(service, branch);
        }
      
        throw {
            message: `Unsupported opeartion ${action}`,
        };
    }

    private async extractArg(argName: string, args: string[]): Promise<string> {
        const argNameInUppercase = argName.toUpperCase();
        const argsInUppercase = args.map(a => a.toUpperCase());
        return argsInUppercase.find(a => a.startsWith(argNameInUppercase) || a.toUpperCase().startsWith('-'+argNameInUppercase))?.split("=")[1]!;
    }
}

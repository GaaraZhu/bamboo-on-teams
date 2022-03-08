import { InvalidArgumentError } from "commander";
import { Action } from "./models/actions";
import { BuildAction } from "./models/buildAction";
import { DeployLatestBuildAction } from "./models/deployLatestBuildAction";
import { PromoteReleaseAction } from "./models/promoteReleaseAction";
import { getConfig } from "./services/config";
import { Operations } from "./services/executors/listEnvironmentsExecutor";

export type Class<T> = {
  new (command: string, triggeredBy: string): T;
};

export const trim = (value: string | undefined): any => {
  if (!value || isEmpty(value)) {
    //undefined checking to make the compiler happy
    throw new InvalidArgumentError("empty argument");
  }

  return value.trim();
};

export const isEmpty = (value: string | undefined): boolean => {
  return !value || /^ *$/.test(value);
};

export const extractCommandFromTeamsMessage = (message: string): string => {
  return message.split("</at>")[1].split("&nbsp;").join(" ").trim();
};

export const fallbackToHTML = (message: string): string => {
  let result = message;
  if (result.includes("\n")) {
    result = result.split("\n").join("<br>");
  }

  if (result.includes("\t")) {
    result = result.split("\t").join("&nbsp;&nbsp;&nbsp;&nbsp;");
  }

  return result;
};

export const prodEnvCheck = (env: string): void => {
  if (isInvalidProdEnv(env)) {
    throw {
      status: 400,
      message: "Bamboo-on-teams is disabled for production environment",
    };
  }
};

export const isInvalidProdEnv = (env: string): boolean => {
  return !getConfig().enabledForProd && env.toUpperCase().startsWith("PROD");
};

export const executeOperationCheck = (operations: Operations): void => {
  if (!operations.allowedToExecute) {
    throw {
      status: 400,
      message: "Not allowed to execute bamboo job",
    };
  }
};

export const viewOperationCheck = (operations: Operations): void => {
  if (!operations.canView) {
    throw {
      status: 400,
      message: "Not allowed to view resource details",
    };
  }
};

/**
 *  Trigger jobs for multiple services.
 *  Note: only build job is supported to avoid the 5 seconds timeout in Teams:
 *  https://github.com/MicrosoftDocs/msteams-docs/issues/693
 *
 * @param action build action
 * @param triggerSingle function to trigger a job for a single service
 */
export const triggerJobForServices = async (
  action: BuildAction,
  triggerSingle: (service: string, action: BuildAction) => Promise<any>
): Promise<any> => {
  const failedServices: string[] = [];
  for (let i = 0; i < action.services.length; i++) {
    const service = action.services[i];
    try {
      await triggerSingle(service, action);
    } catch (err) {
      console.log(
        `Failed to trigger job for service ${service} due to ${JSON.stringify(
          err
        )}`
      );
      failedServices.push(service);
    }
  }
  if (failedServices.length !== 0) {
    throw {
      status: 500,
      message: `Failed to trigger jobs for services: ${failedServices} while other jobs have been triggered.`,
    };
  }
};

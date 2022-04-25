import { InvalidArgumentError } from "commander";
import { TeamsUser } from "./models/teams";
import { getConfig } from "./services/config";
import { Build, getLatestBuild } from "./services/executors/descBuildExecutor";
import { Operations } from "./services/executors/listEnvironmentsExecutor";

export type Class<T> = {
  new (command: string, triggeredBy: TeamsUser): T;
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
  if (result?.includes("\n")) {
    result = result.split("\n").join("<br>");
  }

  if (result?.includes("\t")) {
    result = result.split("\t").join("&nbsp;&nbsp;&nbsp;&nbsp;");
  }

  return result;
};

export const prodEnvCheck = (env: string): void => {
  if (isProdEnv(env) && (!getConfig().prod?.enabled)) {
    throw {
      status: 400,
      message: "Operation is not allowed for production environment",
    };
  }
};

export const allowedUserIdCheck = async (
  currentUser: TeamsUser
): Promise<void> => {
  const allowedUserIds = getConfig().prod?.allowedUserIds;
  if (
    !allowedUserIds?.some(
      (id) => id.toUpperCase().trim() === currentUser.id.toUpperCase().trim()
    )
  ) {
    throw {
      status: 400,
      message: "Operation is not allowed for current user",
    };
  }
};

export const isProdEnv = (env: string): boolean => {
  return env.toUpperCase().startsWith("PROD");
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

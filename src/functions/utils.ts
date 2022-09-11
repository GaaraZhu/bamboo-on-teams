import { InvalidArgumentError } from "commander";
import { TeamsUser } from "./models/teams";
import { getConfig } from "./services/config";
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
  return message
    .split("<at>Bamboo</at>")[1]
    .split("&nbsp;")
    .join(" ")
    .replace(/<\/?[^>]+(>|$)/g, "")
    .replace(/ +(?= )/g, "")
    .trim();
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

export const prodEnvCheck = (env: string, currentUser: TeamsUser): void => {
  if (!isProdEnv(env)) {
    return;
  }

  if (!getConfig().prod?.enabled) {
    throw {
      status: 400,
      message: "Production environment is disabled.",
    };
  }

  if (
    !getConfig().prod?.allowedUserIds.some(
      (userId) => userId.toUpperCase() === currentUser.id.toUpperCase()
    )
  ) {
    throw {
      status: 400,
      message: "Current user is not allowed to perform this action.",
    };
  }
};

export const isProdEnv = (env: string): boolean => {
  return env.trim().toUpperCase().startsWith("PROD");
};

export const executeOperationCheck = (operations: Operations): void => {
  if (!operations.allowedToExecute) {
    throw {
      status: 400,
      message: "Not allowed to execute bamboo job",
    };
  }
};

export const vcsBranchToBambooBranch = (vscBranch: string): string => {
  return vscBranch.split("/").join("-");
}

export const viewOperationCheck = (operations: Operations): void => {
  if (!operations.canView) {
    throw {
      status: 400,
      message: "Not allowed to view resource details",
    };
  }
};

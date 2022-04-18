import { InvalidArgumentError } from "commander";
import { getConfig } from "./services/config";
import { Build, getLatestBuild } from "./services/executors/descBuildExecutor";
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
  if (result?.includes("\n")) {
    result = result.split("\n").join("<br>");
  }

  if (result?.includes("\t")) {
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

export const releaseApprovalCheck = async (env: string): Promise<void> => {
  const releaseApprovalConfig = getConfig().releaseApproval;
  if (!releaseApprovalConfig) {
    console.log(
      "Skip release approval checking as no requirement is configured"
    );
    return;
  }

  if (
    !releaseApprovalConfig.requiredForEnvs
      .map((e) => e.toUpperCase())
      .includes(env.toUpperCase())
  ) {
    console.log(
      `Skip release approval checking as no requirement is configured for environment ${env}`
    );
    return;
  }

  const approvalJobResult: Build | undefined = await getLatestBuild(
    releaseApprovalConfig.bambooPlanId
  );
  if (!approvalJobResult) {
    throw {
      status: 400,
      message:
        "Release is not approved due to no approval job has been executed, please check with the release coordinator",
    };
  }

  const targetEnvironment = approvalJobResult.variables.find(
    (v) => v.name == "environment" && v.value.toUpperCase() == env.toUpperCase()
  );
  if (!targetEnvironment) {
    throw {
      status: 400,
      message: `Release is not approved due to no approval job has been executed for env ${env}, please check with the release coordinator`,
    };
  }

  const approved = approvalJobResult.variables.find(
    (v) => v.name == "approved" && v.value.toUpperCase() == "TRUE"
  );
  if (!approved) {
    throw {
      status: 400,
      message: `Release is not approved for environment ${env}, please check with the release coordinator`,
    };
  }
};

export const isInvalidProdEnv = (env: string): boolean => {
  return !getConfig().enabledForProd && isProdEnv(env);
};

const isProdEnv = (env: string): boolean => {
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

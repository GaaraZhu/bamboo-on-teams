import { InvalidArgumentError } from "commander";
import { StepFunctions } from "aws-sdk";
import { AWSError } from "aws-sdk/lib/error";
import { PromiseResult } from "aws-sdk/lib/request";
import {
  StartExecutionInput,
  StartExecutionOutput,
} from "aws-sdk/clients/stepfunctions";
import {
  BuildJobCheckerInput,
  DeployBuildJobCheckerInput,
  DeployReleaseJobCheckerInput,
} from "./api/handlers/statusChecker";

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

export const prodEnvCheck = (env: string): void => {
  if (isInvalidProdEnv(env)) {
    throw {
      status: 400,
      message: "Bamboo-on-teams is disabled for production environment",
    };
  }
};

export const isInvalidProdEnv = (env: string): boolean => {
  return (
    process.env.ENABLE_FOR_PROD?.toUpperCase() !== "TRUE" &&
    env.toUpperCase().startsWith("PROD")
  );
};

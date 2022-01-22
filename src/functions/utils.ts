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
  if (!value || /^ *$/.test(value)) {
    throw new InvalidArgumentError("empty argument");
  }

  return value.trim();
};

export const prodEnvCheck = (env: string): void => {
  if (
    process.env.ENABLE_FOR_PROD?.toUpperCase() === "TRUE" &&
    env?.toUpperCase().startsWith("PROD")
  ) {
    throw {
      status: 400,
      message: "Bamboo-on-teams is disabled for production environment",
    };
  }
};

// start the statusChecker step function to check job status asynchronizely, and push the result through the configured Teams connector
export const startCheckerExecution = async (
  executionId: string,
  checkerInput:
    | BuildJobCheckerInput
    | DeployBuildJobCheckerInput
    | DeployReleaseJobCheckerInput
): Promise<void> => {
  const input: StartExecutionInput = {
    stateMachineArn: process.env.STATUS_CHECKER_ARN!,
    name: executionId.toString(),
    input: JSON.stringify(checkerInput),
    traceHeader: executionId.toString(),
  };
  const stepFunctions: StepFunctions = new StepFunctions({
    endpoint: process.env.STEP_FUNCTIONS_ENDPOINT,
    region: process.env.REGION,
  });
  const stepFunctionsResult: PromiseResult<StartExecutionOutput, AWSError> =
    await stepFunctions.startExecution(input).promise();
  if (stepFunctionsResult?.$response?.error) {
    console.log(
      `Failed to start stepFunction to check status for build job: ${JSON.stringify(
        checkerInput
      )}`
    );
  }
};

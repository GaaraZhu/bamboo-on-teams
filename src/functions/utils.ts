import { InvalidArgumentError } from "commander";
import { StepFunctions } from "aws-sdk";
import { AWSError } from "aws-sdk/lib/error";
import { PromiseResult } from "aws-sdk/lib/request";
import {
  StartExecutionInput,
  StartExecutionOutput,
} from "aws-sdk/clients/stepfunctions";
import { JobType } from "./models/actions";
import { JobCheckingInput } from "./api/handlers/statusChecker";
import { BuildResult } from "./services/executors/buildExecutor";
import { DeployResult } from "./services/executors/deployLatestBuildExecutor";

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
export const startChecker = async (
  result: BuildResult | DeployResult,
  jobType: JobType,
  service: string,
  branch: string,
  triggeredBy: string
): Promise<void> => {
  const stepFunctions: StepFunctions = new StepFunctions({
    endpoint: process.env.STEP_FUNCTIONS_ENDPOINT,
    region: process.env.REGION,
  });
  let resultKey = (result as BuildResult).buildResultKey;
  let resultUrl = (result as BuildResult).link?.href;
  let buildNumber = (result as BuildResult).buildNumber;
  if (JobType.DEPLOYMENT === jobType) {
    resultKey = (result as DeployResult).deployment.id.toString();
    resultUrl = (result as DeployResult).deployment.link;
    buildNumber = (result as DeployResult).build.buildNumber;
  }
  const inputData: JobCheckingInput = {
    resultKey: resultKey,
    resultUrl: resultUrl,
    service: service,
    branch: branch,
    buildNumber: buildNumber,
    triggeredBy: triggeredBy,
    environment: (result as DeployResult).environment,
    jobType: jobType,
  };
  const input: StartExecutionInput = {
    stateMachineArn: process.env.STATUS_CHECKER_ARN!,
    name: resultKey,
    input: JSON.stringify(inputData),
    traceHeader: resultKey,
  };
  const stepFunctionsResult: PromiseResult<StartExecutionOutput, AWSError> =
    await stepFunctions.startExecution(input).promise();
  if (stepFunctionsResult?.$response?.error) {
    console.log(
      `Failed to start stepFunction to check status for build job: ${JSON.stringify(
        result
      )}`
    );
  }
};

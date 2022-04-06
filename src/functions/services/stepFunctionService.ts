import { AWSError, StepFunctions } from "aws-sdk";
import {
  StartExecutionInput,
  StartExecutionOutput,
} from "aws-sdk/clients/stepfunctions";
import { PromiseResult } from "aws-sdk/lib/request";
import {
  BuildJobCheckerInput,
  DeployBuildJobCheckerInput,
  DeployReleaseJobCheckerInput,
  NewBranchBuildJobCheckerInput,
} from "../api/handlers/statusChecker";
import { v4 as uuidv4 } from "uuid";

const getStepFunctionsClient = async (): Promise<StepFunctions> => {
  if (!process.env.STEP_FUNCTIONS_ENDPOINT) {
    throw {
      status: 500,
      message: "missing configuration for stepfunction endpoint",
    };
  }
  return new StepFunctions({
    endpoint: process.env.STEP_FUNCTIONS_ENDPOINT,
    region: process.env.REGION,
  });
};

// start the statusChecker step function to check job status asynchronizely, and push the result through the configured Teams connector
export const startCheckerExecution = async (
  executionId: string,
  checkerInput:
    | BuildJobCheckerInput
    | NewBranchBuildJobCheckerInput
    | DeployBuildJobCheckerInput
    | DeployReleaseJobCheckerInput
): Promise<void> => {
  const input = getCheckerInput(executionId, checkerInput);
  const stepFunctions: StepFunctions = await getStepFunctionsClient();
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

export const getCheckerInput = (
  executionId: string,
  checkerInput:
    | BuildJobCheckerInput
    | NewBranchBuildJobCheckerInput
    | DeployBuildJobCheckerInput
    | DeployReleaseJobCheckerInput
): StartExecutionInput => {
  return {
    stateMachineArn: process.env.STATUS_CHECKER_ARN!,
    name: executionId.toString(),
    input: JSON.stringify(checkerInput),
    traceHeader: executionId.toString(),
  };
};

export interface BatchDeployerExecutionInput {
  commands: SingleDeployCommand[]; // wrap the command in a JSON object so that the stepfunction Map state can pass the result through `ResultPath`
}

export interface SingleDeployCommand {
  command: string;
  service: string;
  branch: string;
  environment: string;
  triggeredBy: string;
}

export const startBatchDeployerExecution = async (
  input: BatchDeployerExecutionInput
): Promise<void> => {
  const name = uuidv4();
  const executionInput = {
    stateMachineArn: process.env.BATCH_DEPLOYER_ARN!,
    name: name,
    input: JSON.stringify(input),
    traceHeader: name,
  };
  const stepFunctions: StepFunctions = await getStepFunctionsClient();
  const stepFunctionsResult: PromiseResult<StartExecutionOutput, AWSError> =
    await stepFunctions.startExecution(executionInput).promise();
  if (stepFunctionsResult?.$response?.error) {
    console.log(
      `Failed to start stepFunction to deploy services: ${JSON.stringify(
        input
      )}`
    );
  }
};

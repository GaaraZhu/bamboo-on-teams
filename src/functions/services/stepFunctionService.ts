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
import { TeamsUser } from "../models/teams";
import { ActionName } from "../models/actions";

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

export interface ReleaserExecutionInput {
  batches: BatcherExecutionInput[];
}

export interface BatcherExecutionInput {
  actionName: ActionName;
  commands: SingleCommand[]; // wrap the command in a JSON object so that the stepfunction Map state can pass the result through `ResultPath`
}

export type SingleCommand =
  | CreateBranchCommand
  | BuildCommand
  | DeployLatestCommand
  | PromoteDeployCommand;

export interface CreateBranchCommand {
  command: string;
  service: string;
  vcsBranch: string;
  triggeredBy: TeamsUser;
}

export interface BuildCommand {
  command: string;
  service: string;
  branch: string;
  triggeredBy: TeamsUser;
}

export interface DeployLatestCommand {
  command: string;
  service: string;
  branch: string;
  environment: string;
  triggeredBy: TeamsUser;
}

export interface PromoteDeployCommand {
  command: string;
  service: string;
  sourceEnv: string;
  targetEnv: string;
  triggeredBy: TeamsUser;
}

export type SingleCommandResult = SingleCommand & {
  target: any, // Bamboo job execution result
  triggerResult: any, // Bamboo job triggering result
};

export const startExecution = async (
  input:
    | BatcherExecutionInput
    | BatcherExecutionInput[]
    | ReleaserExecutionInput,
  arn: string = process.env.BATCHER_ARN!
): Promise<void> => {
  const name = uuidv4();
  const executionInput = {
    stateMachineArn: arn,
    name: name,
    input: JSON.stringify(input),
    traceHeader: name,
  };
  const stepFunctions: StepFunctions = await getStepFunctionsClient();
  const stepFunctionsResult: PromiseResult<StartExecutionOutput, AWSError> =
    await stepFunctions.startExecution(executionInput).promise();
  if (stepFunctionsResult?.$response?.error) {
    console.log(
      `Failed to start stepFunction for: ${JSON.stringify(
        input
      )} due to ${JSON.stringify(stepFunctionsResult?.$response?.error)}`
    );
  }
};

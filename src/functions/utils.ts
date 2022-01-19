import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { InvalidArgumentError } from "commander";
import { StepFunctions } from "aws-sdk";
import { AWSError } from "aws-sdk/lib/error";
import { PromiseResult } from "aws-sdk/lib/request";
import {
  StartExecutionInput,
  StartExecutionOutput,
} from "aws-sdk/clients/stepfunctions";
import { JobType } from "./models/actions";
import { BuildJobCheckingInput } from "./api/handlers/statusChecker";
import { BuildResult } from "./services/executors/buildExecutor";
import { BuildAction } from "./models/buildAction";

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
  buildResult: BuildResult,
  action: BuildAction
): Promise<void> => {
  const stepFunctions: StepFunctions = new StepFunctions({
    endpoint: process.env.STEP_FUNCTIONS_ENDPOINT,
    region: process.env.REGION,
  });
  const inputData: BuildJobCheckingInput = {
    resultKey: buildResult.buildResultKey,
    service: action.service,
    branch: action.branch,
    triggeredBy: action.triggeredBy,
  };
  const input: StartExecutionInput = {
    stateMachineArn: process.env.STATUS_CHECKER_ARN!,
    name: buildResult.buildResultKey,
    input: JSON.stringify(inputData),
    traceHeader: buildResult.buildResultKey,
  };
  const stepFunctionsResult: PromiseResult<StartExecutionOutput, AWSError> =
    await stepFunctions.startExecution(input).promise();
  if (stepFunctionsResult?.$response?.error) {
    console.log(
      `Failed to start stepFunction to check status for build job: ${JSON.stringify(
        buildResult
      )}`
    );
  }
};

export const axiosGet = async (
  url: string,
  config?: AxiosRequestConfig
): Promise<AxiosResponse> => {
  return await axiosProcess(
    (url, _, config) => axios.get(url, config),
    url,
    undefined,
    config
  );
};

export const axiosPost = async (
  url: string,
  payload: any,
  config?: AxiosRequestConfig
): Promise<AxiosResponse> => {
  return await axiosProcess(axios.post, url, payload, config);
};

export const axiosPut = async (
  url: string,
  payload: any,
  config?: AxiosRequestConfig
): Promise<AxiosResponse> => {
  return await axiosProcess(axios.put, url, payload, config);
};

const axiosProcess = async (
  process: (
    url: string,
    payload?: any,
    config?: AxiosRequestConfig
  ) => Promise<AxiosResponse>,
  url: string,
  payload?: any,
  config?: AxiosRequestConfig
): Promise<AxiosResponse> => {
  let response;
  try {
    response = await process(url, payload, config);
  } catch (err: any) {
    // axios error handling
    console.log(`Failed to call ${url} due to ${JSON.stringify(err)}`);
    throw {
      status: err.response?.status,
      message: err.response?.data?.message || err.message,
    };
  }

  // response failure handling
  if (response.status >= 300) {
    console.log(
      `Unhappy response ${response.status} received when calling ${url} due to ${response.statusText}`
    );
    throw {
      status: response.status,
      message: response.statusText,
    };
  }
  return response;
};

import { getBranch } from "./listPlanBranchesExecutor";
import { BuildAction } from "../../models/buildAction";
import { axiosPost } from "../axiosService";
import {
  BuildJobCheckerInput,
  CheckerInputType,
} from "../../api/handlers/statusChecker";
import { startCheckerExecution } from "../stepFunctionService";
import { getConfig } from "../config";

export const executeBuildCommand = async (
  action: BuildAction
): Promise<any> => {
  const failedServices: string[] = [];
  action.services.forEach((service) => {
    try {
      buildSingle(service, action.branch, action.triggeredBy);
    } catch (err) {
      failedServices.push(service);
    }
  });
  if (failedServices.length !== 0) {
    throw {
      status: 500,
      message: `Failed to build service(s): ${failedServices}`,
    };
  }
};

const buildSingle = async (
  service: string,
  branchName: string,
  triggeredBy: string
): Promise<any> => {
  const buildResult = await build(service, branchName);

  // start async job status checker and push the result to MS Teams
  const checkerInput: BuildJobCheckerInput = {
    type: CheckerInputType.BUILD,
    resultKey: buildResult.buildResultKey,
    resultUrl: buildResult.link.href,
    service: service,
    branch: branchName,
    buildNumber: buildResult.buildNumber,
    triggeredBy: triggeredBy,
  };
  await startCheckerExecution(buildResult.buildResultKey, checkerInput);
  return buildResult;
};

const build = async (
  planName: string,
  branchName: string
): Promise<BuildResult> => {
  const branch = await getBranch(planName, branchName);
  const url = `https://${getConfig().bambooHostUrl}/rest/api/latest/queue/${
    branch.key
  }`;
  const { data } = await axiosPost(url, undefined, {
    headers: {
      Authorization: `Bearer ${getConfig().bambooAPIToken}`,
    },
  });

  return data;
};

export interface BuildResult {
  planKey: string;
  buildNumber: string;
  buildResultKey: string;
  triggerReason: string;
  link: {
    href: string;
    rel: string;
  };
}

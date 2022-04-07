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
  action: BuildAction,
  isBatch = false
): Promise<any> => {
  const buildResult = await build(action.service, action.branch);

  // start async job status checker and push the result to MS Teams
  // NOTE: batch job has its own status checking logic for final notification push
  if (!isBatch) {
    const checkerInput: BuildJobCheckerInput = {
      type: CheckerInputType.BUILD,
      resultKey: buildResult.buildResultKey,
      resultUrl: buildResult.link.href,
      service: action.service,
      branch: action.branch,
      buildNumber: buildResult.buildNumber,
      triggeredBy: action.triggeredBy,
    };
    await startCheckerExecution(buildResult.buildResultKey, checkerInput);
  }
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

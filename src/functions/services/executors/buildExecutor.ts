import { getBranch } from "./listPlanBranchesExecutor";
import { BuildAction } from "../../models/buildAction";
import { axiosPost } from "../axiosService";
import {
  BuildJobCheckerInput,
  CheckerInputType,
} from "../../api/handlers/statusChecker";
import { startCheckerExecution } from "../stepFunctionService";
import { getConfig } from "../config";
import { BuildResult, getRunningBuild } from "./listBuildsExecutor";

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
  try {
    return await buildBranch(branch.key);
  } catch (err: any) {
    if (err.status === 400) {
      // most of the cases it fails due to maximum concurrent builds reached
      const runningBuild = (await getRunningBuild(branch.key)) as BuildResult;
      if (runningBuild) {
        return runningBuild;
      }
    }

    throw err;
  }
};

const buildBranch = async (branchKey: string): Promise<BuildResult> => {
  const url = `https://${
    getConfig().bambooHostUrl
  }/rest/api/latest/queue/${branchKey}`;
  const { data } = await axiosPost(url, undefined, {
    headers: {
      Authorization: `Bearer ${getConfig().bambooAPIToken}`,
    },
  });

  return data;
};

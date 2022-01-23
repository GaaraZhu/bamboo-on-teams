import { getBranch } from "./listPlanBranchesExecutor";
import { BuildAction } from "../../models/buildAction";
import { axiosPost } from "../axiosService";
import { startCheckerExecution } from "../../utils";
import {
  BuildJobCheckerInput,
  CheckerInputType,
} from "../../api/handlers/statusChecker";

export const executeBuildCommand = async (
  action: BuildAction
): Promise<any> => {
  const buildResult = await build(action.service, action.branch);

  // start async job status checker and push the result to MS Teams
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
  return buildResult;
};

const build = async (
  planName: string,
  branchName: string
): Promise<BuildResult> => {
  const branch = await getBranch(planName, branchName);
  const url = `https://${process.env.BAMBOO_HOST_URL}/rest/api/latest/queue/${branch.key}`;
  const { data } = await axiosPost(url, undefined, {
    headers: {
      Authorization: `Bearer ${process.env.BAMBOO_API_TOKEN}`,
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

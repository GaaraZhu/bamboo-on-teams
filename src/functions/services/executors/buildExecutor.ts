import { Response } from "lambda-api";
import { getBranch } from "./listPlanBranchesExecutor";
import { BuildAction } from "../../models/buildAction";
import { axiosPost, startChecker } from "../../utils";
import { JobType } from "../../models/actions";

export const executeBuildCommand = async (
  action: BuildAction,
  response: Response
): Promise<void> => {
  const buildResult = await build(action.service, action.branch);
  response.status(200).json(buildResult);
  await startChecker(buildResult, JobType.BUILD, action.service, action.branch, action.triggeredBy);
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

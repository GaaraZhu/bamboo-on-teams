import { Response } from "lambda-api";
import axios from "axios";
import { ListPlanBranchBuildsAction } from "../../models/listPlanBranchBuildsAction";
import { getBranch } from "./listPlanBranchesExecutor";

export const executeListPlanBranchBuilds = async (
  action: ListPlanBranchBuildsAction,
  response: Response
): Promise<void> => {
  const branch = await getBranch(action.planName, action.branchName);
  response.status(200).json(
    (await listPlanBranchBuilds(branch.key)).map((r: any) => ({
      buildNumber: r.buildNumber,
      lifeCycleState: r.lifeCycleState,
      buildState: r.buildState,
    }))
  );
};

export const listPlanBranchBuilds = async (branchKey: string): Promise<any> => {
  const url = `https://${process.env.BAMBOO_HOST_URL}/rest/api/latest/result/${branchKey}?includeAllStates=true`;
  const { data } = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${process.env.BAMBOO_API_TOKEN}`,
    },
  });

  return data.results.result?.map((r: any) => ({
    key: r.key,
    buildNumber: r.buildNumber,
    lifeCycleState: r.lifeCycleState,
    buildState: r.buildState,
    url: r.link.href,
  }));
};

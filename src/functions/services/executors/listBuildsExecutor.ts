import { Response } from "lambda-api";
import { ListBuildsAction } from "../../models/listBuildsAction";
import { axiosGet } from "../../utils";
import { getBranch } from "./listPlanBranchesExecutor";

export const executeListBuildsCommand = async (
  action: ListBuildsAction,
  response: Response
): Promise<void> => {
  const branch = await getBranch(action.planName, action.branchName);
  response.status(200).json(await listPlanBranchBuilds(branch.key));
};

export const listPlanBranchBuilds = async (branchKey: string): Promise<any> => {
  const url = `https://${process.env.BAMBOO_HOST_URL}/rest/api/latest/result/${branchKey}?includeAllStates=true`;
  const { data } = await axiosGet(url, {
    headers: {
      Authorization: `Bearer ${process.env.BAMBOO_API_TOKEN}`,
    },
  });

  return data.results.result?.map((r: any) => ({
    key: r.key,
    lifeCycleState: r.lifeCycleState,
    buildState: r.buildState,
  }));
};

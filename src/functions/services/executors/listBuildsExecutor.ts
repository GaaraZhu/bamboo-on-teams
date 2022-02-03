import { ListBuildsAction } from "../../models/listBuildsAction";
import { axiosGet } from "../axiosService";
import { getBranch } from "./listPlanBranchesExecutor";

export const executeListBuildsCommand = async (
  action: ListBuildsAction
): Promise<any> => {
  const branch = await getBranch(action.planName, action.branchName);
  return await listPlanBranchBuilds(branch.key);
};

export const listPlanBranchBuilds = async (branchKey: string): Promise<any> => {
  const url = `https://${process.env.BAMBOO_HOST_URL}/rest/api/latest/result/${branchKey}?includeAllStates=true&max-results=10&expand=results.result`;
  const { data } = await axiosGet(url, {
    headers: {
      Authorization: `Bearer ${process.env.BAMBOO_API_TOKEN}`,
    },
  });

  return data.results.result?.map((r: any) => ({
    key: r.key,
    lifeCycleState: r.lifeCycleState,
    buildState: r.buildState,
    buildRelativeTime: r.buildRelativeTime,
  }));
};

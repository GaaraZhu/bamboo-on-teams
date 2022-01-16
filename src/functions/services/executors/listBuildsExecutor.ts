import { Response } from "lambda-api";
import axios from "axios";
import { ListBuildsAction } from "../../models/listBuildsAction";
import { getBranch } from "./listPlanBranchesExecutor";
import { statusCheck } from "../../utils";

export const executeListBuildsCommand = async (
  action: ListBuildsAction,
  response: Response
): Promise<void> => {
  const branch = await getBranch(action.planName, action.branchName);
  response.status(200).json(await listPlanBranchBuilds(branch.key));
};

export const listPlanBranchBuilds = async (branchKey: string): Promise<any> => {
  const url = `https://${process.env.BAMBOO_HOST_URL}/rest/api/latest/result/${branchKey}?includeAllStates=true`;
  const { data, status, statusText } = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${process.env.BAMBOO_API_TOKEN}`,
    },
  });

  statusCheck(status, statusText);

  return data.results.result?.map((r: any) => ({
    key: r.key,
    lifeCycleState: r.lifeCycleState,
    buildState: r.buildState,
  }));
};

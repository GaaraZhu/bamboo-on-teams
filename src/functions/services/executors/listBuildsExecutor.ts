import { ListBuildsAction } from "../../models/listBuildsAction";
import { axiosGet } from "../axiosService";
import { getConfig } from "../config";
import { getBranch } from "./listPlanBranchesExecutor";

export const executeListBuildsCommand = async (
  action: ListBuildsAction
): Promise<BuildResult[]> => {
  const branch = await getBranch(action.planName, action.branchName);
  return await listPlanBranchBuilds(branch.key);
};

export const getRunningBuild = async (
  branchKey: string
): Promise<BuildResult | undefined> => {
  const builds = await listPlanBranchBuilds(branchKey, 1);
  return builds?.find((r: any) =>
    ["Queued", "InProgress"].includes(r.lifeCycleState)
  );
};

export const listPlanBranchBuilds = async (
  branchKey: string,
  maxResults = 3
): Promise<BuildResult[]> => {
  const url = `https://${
    getConfig().bambooHostUrl
  }/rest/api/latest/result/${branchKey}?includeAllStates=true&max-results=${maxResults}&expand=results.result`;
  const { data } = await axiosGet(url, {
    headers: {
      Authorization: `Bearer ${getConfig().bambooAPIToken}`,
    },
  });

  return data.results.result?.map((r: any) => ({
    buildNumber: r.buildNumber,
    buildResultKey: r.key,
    lifeCycleState: r.lifeCycleState,
    buildState: r.buildState,
    buildRelativeTime: r.buildRelativeTime,
    link: r.link,
  }));
};

export interface BuildResult {
  buildNumber: string;
  buildResultKey: string;
  lifeCycleState: string;
  buildState: string;
  buildRelativeTime: string;
  link: {
    href: string;
    rel: string;
  };
}

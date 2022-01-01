import { Response } from "lambda-api";
import { getBranch } from "./listPlanBranchesExecutor";
import { LastBuildAction } from "../../models/lastBuildAction";
import { listPlanBranchBuilds } from "./listPlanBranchBuildsExecutor";
import axios from "axios";

export const executeLastBuild = async (
  action: LastBuildAction,
  response: Response
): Promise<void> => {
  const branch = await getBranch(action.service, action.branch);
  const builds = await listPlanBranchBuilds(branch.key);
  if (builds && builds.length > 0) {
    response.status(200).json(await getBuild(builds[0].url));
  } else {
    response.status(404);
  }
};

const getBuild = async (url: string): Promise<any> => {
  const { data } = await axios.get(`${url}?expand=changes`, {
    headers: {
      Authorization: `Bearer ${process.env.BAMBOO_API_TOKEN}`,
    },
  });

  return {
    buildNumber: data.buildNumber,
    lifeCycleState: data.lifeCycleState,
    buildState: data.buildState,
    buildRelativeTime: data.buildRelativeTime,
    changes: data.changes,
  };
};

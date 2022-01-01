import { Response } from "lambda-api";
import axios from "axios";
import { getBranch } from "./listPlanBranchesExecutor";
import { BuildAction } from "../../models/buildAction";

export const executeBuild = async (
  action: BuildAction,
  response: Response
): Promise<void> => {
  response.status(200).json(await build(action.service, action.branch));
};

const build = async (planName: string, branchName: string): Promise<any> => {
  const branch = await getBranch(planName, branchName);
  const url = `https://${process.env.BAMBOO_HOST_URL}/rest/api/latest/queue/${branch.key}`;
  const { data } = await axios.post(url, undefined, {
    headers: {
      Authorization: `Bearer ${process.env.BAMBOO_API_TOKEN}`,
    },
  });

  return data;
};

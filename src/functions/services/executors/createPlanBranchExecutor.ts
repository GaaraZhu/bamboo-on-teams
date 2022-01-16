import { Response } from "lambda-api";
import axios from "axios";
import { getPlan } from "./listPlansExecutor";
import { createBranchAction } from "../../models/createBranchAction";
import { statusCheck } from "../../utils";

export const executeCreateBranchCommand = async (
  action: createBranchAction,
  response: Response
): Promise<void> => {
  const plan = await getPlan(action.planName);
  const vscBranches = await getAllBranches(plan.key);
  const vscBranch: string = vscBranches.find(
    (b: any) => b.toUpperCase() === action.vscBranch.toUpperCase()
  );
  if (!vscBranch) {
    throw Error(
      `Unknown vsc branch provided ${action.vscBranch}, available branches: ${vscBranches}`
    );
  }
  const branch = await createPlanBranch(plan.key, vscBranch);
  response.status(200).json(branch);
};

const getAllBranches = async (planKey: string): Promise<any> => {
  const url = `https://${process.env.BAMBOO_HOST_URL}/rest/api/latest/plan/${planKey}/vcsBranches?max-result=10000`;
  const { data } = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${process.env.BAMBOO_API_TOKEN}`,
    },
  });

  return data.branches?.branch?.map((b: any) => b.name);
};

const createPlanBranch = async (
  planKey: string,
  vscBranch: string
): Promise<any> => {
  const url = `https://${
    process.env.BAMBOO_HOST_URL
  }/rest/api/latest/plan/${planKey}/branch/${vscBranch.replace(
    /\//g,
    "-"
  )}?vcsBranch=${vscBranch}`;
  const { data, status, statusText } = await axios.put(url, undefined, {
    headers: {
      Authorization: `Bearer ${process.env.BAMBOO_API_TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  statusCheck(status, statusText);

  return data;
};

import { getPlan } from "./listPlansExecutor";
import { CreateBranchAction } from "../../models/createBranchAction";
import { axiosGet, axiosPut } from "../axiosService";

export const executeCreateBranchCommand = async (
  action: CreateBranchAction
): Promise<any> => {
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
  return await createPlanBranch(plan.key, vscBranch);
};

const getAllBranches = async (planKey: string): Promise<any> => {
  const url = `https://${process.env.BAMBOO_HOST_URL}/rest/api/latest/plan/${planKey}/vcsBranches?max-result=10000`;
  const { data } = await axiosGet(url, {
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
  const { data } = await axiosPut(url, undefined, {
    headers: {
      Authorization: `Bearer ${process.env.BAMBOO_API_TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  return data;
};

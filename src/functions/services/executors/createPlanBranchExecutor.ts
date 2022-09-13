import { getPlan } from "./listPlansExecutor";
import { CreateBranchAction } from "../../models/createBranchAction";
import { axiosGet, axiosPut } from "../axiosService";
import {
  CheckerInputType,
  NewBranchBuildJobCheckerInput,
} from "../../api/handlers/statusChecker";
import { startCheckerExecution } from "../stepFunctionService";
import { getConfig } from "../config";

export const executeCreateBranchCommand = async (
  action: CreateBranchAction,
  isBatch = false
): Promise<any> => {
  const plan = await getPlan(action.service);
  const vcsBranches = await getAllBranches(plan.key);
  const vcsBranch: string = vcsBranches.find(
    (b: any) => b.toUpperCase() === action.vcsBranch.toUpperCase()
  );
  if (!vcsBranch) {
    throw Error(`Unknown vcs branch provided ${action.vcsBranch}`);
  }
  const branchData = await createPlanBranch(plan.key, vcsBranch);

  // start async job status checker and push the result to MS Teams
  // NOTE: batch job has its own status checking logic for final notification push
  if (!isBatch) {
    const checkerInput: NewBranchBuildJobCheckerInput = {
      type: CheckerInputType.NEW_BRANCH_BUILD,
      branchKey: branchData.key,
      branchName: branchData.shortName,
      service: action.service,
      triggeredBy: action.triggeredBy,
    };
    await startCheckerExecution(checkerInput.branchKey, checkerInput);
  }

  return branchData;
};

const getAllBranches = async (planKey: string): Promise<any> => {
  const url = `https://${
    getConfig().bambooHostUrl
  }/rest/api/latest/plan/${planKey}/vcsBranches?max-result=10000`;
  const { data } = await axiosGet(url, {
    headers: {
      Authorization: `Bearer ${getConfig().bambooAPIToken}`,
    },
  });

  return data.branches?.branch?.map((b: any) => b.name);
};

export const createPlanBranch = async (
  planKey: string,
  vcsBranch: string
): Promise<any> => {
  const url = `https://${
    getConfig().bambooHostUrl
  }/rest/api/latest/plan/${planKey}/branch/${vcsBranch.replace(
    /\//g,
    "-"
  )}?vcsBranch=${vcsBranch}`;
  const { data } = await axiosPut(url, undefined, {
    headers: {
      Authorization: `Bearer ${getConfig().bambooAPIToken}`,
      "Content-Type": "application/json",
    },
  });

  return data;
};

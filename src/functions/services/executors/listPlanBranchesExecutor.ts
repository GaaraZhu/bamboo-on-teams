import { ListBranchesAction } from "../../models/listBranchesAction";
import { vcsBranchToBambooBranch } from "../../utils";
import { axiosGet } from "../axiosService";
import { getConfig } from "../config";
import { createPlanBranch } from "./createPlanBranchExecutor";
import { getPlan } from "./listPlansExecutor";

export const executeListBranchesCommand = async (
  action: ListBranchesAction
): Promise<any> => {
  const plan = await getPlan(action.planName);
  const branches = await listPlanBranches(plan.key);
  return branches.map((b: any) => b.name);
};

export const getBranch = async (
  planName: string,
  branchName: string
): Promise<any> => {
  const plan = await getPlan(planName);
  return await getBranchByNameAndPlanKey(plan.key, branchName);
};

export const getBranchByNameAndPlanKey = async (
  planKey: string,
  branchName: string
): Promise<any> => {
  // 1. find bamboo branch plan with incoming branch name (vcs branch or bamboo branch)
  const branches = await listPlanBranches(planKey);
  const branch = branches.find(
    (b: any) => [branchName.toUpperCase(), vcsBranchToBambooBranch(branchName)?.toUpperCase()].includes(b.name.toUpperCase())
  );
  if (branch) {
    return branch;
  }
  // 2. try to create bamboo branch with the incoming branch name (vcs branch)
  try {
    return await createPlanBranch(planKey, branchName);
  } catch (err) {
    console.log(`Failed to create bamboo branch due to ${JSON.stringify(err)}`);
    throw {
      status: 400,
      message: `Invalid branch: ${branchName}`,
    };
  }
};

const listPlanBranches = async (planKey: string): Promise<any> => {
  const url = `https://${
    getConfig().bambooHostUrl
  }/rest/api/latest/plan/${planKey}?expand=branches&max-result=10000`;
  const { data } = await axiosGet(url, {
    headers: {
      Authorization: `Bearer ${getConfig().bambooAPIToken}`,
    },
  });

  const branches = data.branches.branch
    ?.filter((b: any) => b.enabled)
    .map((b: any) => ({
      name: b.shortName,
      key: b.key,
    }));
  return [
    {
      name: "master",
      key: planKey,
    },
    ...branches,
  ];
};

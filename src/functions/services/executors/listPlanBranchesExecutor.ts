import { ListBranchesAction } from "../../models/listBranchesAction";
import { axiosGet } from "../axiosService";
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
  const branches = await listPlanBranches(planKey);
  const branch = branches.find(
    (b: any) => b.name.toUpperCase() === branchName.toUpperCase()
  );
  if (!branch) {
    throw {
      status: 400,
      message: `Unknown branch provided ${branchName} for plan key ${planKey}, available branches: ${branches.map(
        (b: any) => b.name
      )}`,
    };
  }

  return branch;
};

const listPlanBranches = async (planKey: string): Promise<any> => {
  const url = `https://${process.env.BAMBOO_HOST_URL}/rest/api/latest/plan/${planKey}?expand=branches&max-result=10000`;
  const { data } = await axiosGet(url, {
    headers: {
      Authorization: `Bearer ${process.env.BAMBOO_API_TOKEN}`,
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

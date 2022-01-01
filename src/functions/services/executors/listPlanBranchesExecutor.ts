import { ListPlansAction } from "../../models/listPlansCommand";
import { Response } from "lambda-api";
import axios from "axios";
import { ListPlanBranchesAction } from "../../models/listPlanBranchesAction";
import { listPlans } from "./listPlanExecutor";

export const executeListPlanBranches = async (
  action: ListPlanBranchesAction,
  response: Response
): Promise<void> => {
  const plans = await listPlans();
  const plan = plans.find(
    (p: any) => p.name.toUpperCase() === action.planName.toUpperCase()
  );
  if (!plan) {
    throw Error(
      `Unknow plan provided ${action.planName}, available plans: ${plans.map(
        (p: any) => p.name
      )}`
    );
  }

  const branches = await listPlanBranches(plan.key);
  response.status(200).json(branches.map((b: any) => b.name));
};

export const listPlanBranches = async (planKey: string): Promise<any> => {
  const url = `https://${process.env.BAMBOO_HOST_URL}/rest/api/latest/plan/${planKey}?expand=branches`;
  const { data } = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${process.env.BAMBOO_API_TOKEN}`,
    },
  });

  return data.branches.branch
    ?.filter((b: any) => b.enabled)
    .map((b: any) => ({
      name: b.shortName,
      key: b.key,
    }));
};

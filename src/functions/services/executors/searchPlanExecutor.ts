import { SearchPlanAction } from "../../models/searchPlanAction";
import { listPlans } from "./listPlansExecutor";

export const executeSearchPlanCommand = async (
  action: SearchPlanAction
): Promise<any> => {
  return (await searchPlan(action.planName)).map((p: any) => p.name);
};

export const searchPlan = async (planName: string): Promise<any> => {
  const plans = await listPlans();

  return plans.filter(
    (p: any) => p.name.toUpperCase().includes(planName.toUpperCase())
  );
};

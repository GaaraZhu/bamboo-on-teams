import { SearchPlansAction } from "../../models/searchPlansAction";
import { listPlans } from "./listPlansExecutor";

export const executeSearchPlansCommand = async (
  action: SearchPlansAction
): Promise<any> => {
  return (await searchPlans(action.planName)).map((p: any) => p.name);
};

export const searchPlans = async (planName: string): Promise<any> => {
  const plans = await listPlans();

  return plans.filter((p: any) =>
    p.name.toUpperCase().includes(planName.toUpperCase())
  );
};

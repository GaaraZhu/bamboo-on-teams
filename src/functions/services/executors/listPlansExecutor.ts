import { ListPlansAction } from "../../models/listPlansAction";
import { axiosGet } from "../axiosService";
import { getConfig } from "../config";

export const executeListPlansCommand = async (
  action: ListPlansAction
): Promise<any> => {
  return (await listPlans()).map((p: any) => p.name);
};

export const getPlan = async (planName: string): Promise<any> => {
  const plans = await listPlans();
  const plan = plans.find(
    (p: any) => p.name.toUpperCase() === planName.toUpperCase()
  );
  if (!plan) {
    throw {
      status: 400,
      message: `Unknown plan provided ${planName}, please use search-plans command to find it first and make sure the plan is enabled`,
    };
  }

  return plan;
};

export const listPlans = async (): Promise<any> => {
  const url = `https://${
    getConfig().bambooHostUrl
  }/rest/api/latest/plan.json?max-result=10000`;
  const { data } = await axiosGet(url, {
    headers: {
      Authorization: `Bearer ${getConfig().bambooAPIToken}`,
    },
  });

  return data.plans.plan
    ?.filter((p: any) => p.enabled)
    .map((p: any) => ({
      name: p.shortName.replace(/ +/g, "-"),
      key: p.key,
    }))
    .sort();
};

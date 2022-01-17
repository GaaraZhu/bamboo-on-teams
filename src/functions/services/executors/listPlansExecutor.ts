import { ListPlansAction } from "../../models/listPlansAction";
import { Response } from "lambda-api";
import { axiosGet } from "../../utils";

export const executeListPlansCommand = async (
  action: ListPlansAction,
  response: Response
): Promise<void> => {
  response.status(200).json((await listPlans()).map((p: any) => p.name));
};

export const getPlan = async (planName: string): Promise<any> => {
  const plans = await listPlans();
  const plan = plans.find(
    (p: any) => p.name.toUpperCase() === planName.toUpperCase()
  );
  if (!plan) {
    throw {
      status: 400,
      message: `Unknown plan provided ${planName}, available plans: ${plans.map(
        (p: any) => p.name
      )}`,
    };
  }

  return plan;
};

const listPlans = async (): Promise<any> => {
  const url = `https://${process.env.BAMBOO_HOST_URL}/rest/api/latest/project/${process.env.BAMBOO_PROJECT_ID}?expand=plans&max-result=10000`;
  const { data, status, statusText } = await axiosGet(url, {
    headers: {
      Authorization: `Bearer ${process.env.BAMBOO_API_TOKEN}`,
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

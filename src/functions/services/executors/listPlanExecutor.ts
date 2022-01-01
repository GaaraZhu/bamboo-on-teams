import { ListPlansAction } from "../../models/listPlansCommand";
import { Response } from "lambda-api";
import axios from "axios";

export const executeListPlans = async (
  action: ListPlansAction,
  response: Response
): Promise<void> => {
  response.status(200).json((await listPlans()).map((p: any) => p.name));
};

export const listPlans = async (): Promise<any> => {
  const url = `https://${process.env.BAMBOO_HOST_URL}/rest/api/latest/project/${process.env.BAMBOO_PROJECT_ID}?expand=plans&max-result=10000`;
  const { data } = await axios.get(url, {
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

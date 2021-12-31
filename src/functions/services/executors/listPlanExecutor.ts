import { ListPlansAction } from "../../models/listPlansCommand";
import { Response } from "lambda-api";
import axios from "axios";

export const listPlans = async (
  action: ListPlansAction,
  response: Response
): Promise<void> => {
  const url = `https://${process.env.BAMBOO_HOST_URL}/rest/api/latest/project/${action.project}?expand=plans&max-result=10000`;
  const { data } = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${process.env.BAMBOO_API_TOKEN}`,
    },
  });
  console.log(data);
  response.status(200).json({
    data: data,
  });
};

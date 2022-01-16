import { Response } from "lambda-api";
import { DescBuildAction } from "../../models/descBuildAction";
import axios from "axios";
import { statusCheck } from "../../utils";

export const executeDescBuildCommand = async (
  action: DescBuildAction,
  response: Response
): Promise<void> => {
  response.status(200).json(await getBuild(action.build));
};

export const getBuild = async (key: string): Promise<any> => {
  const url = `https://${process.env.BAMBOO_HOST_URL}/rest/api/latest/result/${key}`;
  const { data, status, statusText } = await axios.get(
    `${url}?expand=changes`,
    {
      headers: {
        Authorization: `Bearer ${process.env.BAMBOO_API_TOKEN}`,
      },
    }
  );

  statusCheck(status, statusText);

  return {
    key: data.key,
    buildNumber: data.buildNumber,
    branch: {
      key: data.plan.key,
      name: data.plan.shortName,
    },
    lifeCycleState: data.lifeCycleState,
    buildState: data.buildState,
    buildRelativeTime: data.buildRelativeTime,
    changes: data.changes?.change?.map((c: any) => ({
      author: c.author,
      commit: c.changesetId,
    })),
  };
};

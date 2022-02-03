import { DescBuildAction } from "../../models/descBuildAction";
import { axiosGet } from "../axiosService";

export const executeDescBuildCommand = async (
  action: DescBuildAction
): Promise<any> => {
  return await getBuild(action.build);
};

export const getLatestBuild = async (branchKey: string): Promise<any> => {
  const url = `https://${process.env.BAMBOO_HOST_URL}/rest/api/latest/result/${branchKey}?max-results=1&expand=results.result`;
  const { data } = await axiosGet(url, {
    headers: {
      Authorization: `Bearer ${process.env.BAMBOO_API_TOKEN}`,
    },
  });

  return data.results.result && data.results.result[0]
    ? await getBuild(data.results.result[0].key)
    : undefined;
};

export const getBuild = async (key: string): Promise<Build> => {
  const url = `https://${process.env.BAMBOO_HOST_URL}/rest/api/latest/result/${key}`;
  const { data } = await axiosGet(`${url}?expand=changes`, {
    headers: {
      Authorization: `Bearer ${process.env.BAMBOO_API_TOKEN}`,
    },
  });

  return {
    key: data.key,
    buildNumber: data.buildNumber,
    service: data.master?.shortName || data.planName,
    branch: {
      key: data.plan?.key,
      name: data.master ? data.plan?.shortName : "master",
    },
    lifeCycleState: data.lifeCycleState,
    buildState: data.buildState,
    buildRelativeTime: data.buildRelativeTime,
    buildDuration: data.buildDurationDescription,
    url: url,
    changes: data.changes?.change?.map((c: any) => ({
      author: c.author,
      commit: c.changesetId,
    })),
  };
};

export interface Build {
  key: string;
  service: string;
  buildNumber: string;
  branch: {
    key: string;
    name: string;
  };
  lifeCycleState: string;
  buildState: string;
  buildRelativeTime: string;
  buildDuration: string;
  url: string;
  changes: {
    author: string;
    commit: string;
  }[];
}

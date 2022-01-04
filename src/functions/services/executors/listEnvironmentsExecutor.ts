import { Response } from "lambda-api";
import axios from "axios";
import { getDeploymentProject } from "./listDeploymentProjectsExecutor";
import { ListEnvironmentsAction } from "../../models/listEnvironmentsAction";

export const executeListEnvironmentsCommand = async (
  action: ListEnvironmentsAction,
  response: Response
): Promise<void> => {
  const project = await getDeploymentProject(action.deploymentProject);
  response
    .status(200)
    .json((await listEnvironments(project.id)).map((e: any) => e.name));
};

export const getEnvironment = async (
  projectId: string,
  envName: string
): Promise<any> => {
  const envs = await listEnvironments(projectId);
  const env = envs.find(
    (e: any) => e.name.toUpperCase() === envName.toUpperCase()
  );
  if (!env) {
    throw Error(
      `Unknown environment provided ${envName}, availables: ${envs.map(
        (e: any) => e.name
      )}`
    );
  }

  return env;
};

const listEnvironments = async (projectId: string): Promise<any> => {
  const url = `https://${process.env.BAMBOO_HOST_URL}/rest/api/latest/deploy/project/${projectId}`;
  const { data } = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${process.env.BAMBOO_API_TOKEN}`,
    },
  });

  return data.environments
    .filter(
      (e: any) =>
        e.operations.canView &&
        e.operations.canExecute &&
        e.operations.allowedToExecute &&
        e.configurationState === "TASKED"
    )
    .map((e: any) => ({
      id: e.id,
      name: e.name,
    }));
};

import { Response } from "lambda-api";
import { getDeploymentProject } from "./listDeploymentProjectsExecutor";
import { ListEnvironmentsAction } from "../../models/listEnvironmentsAction";
import { axiosGet } from "../axiosService";

export const executeListEnvironmentsCommand = async (
  action: ListEnvironmentsAction,
  response: Response
): Promise<void> => {
  const project = await getDeploymentProject(action.deploymentProject);
  response.status(200).json(await listEnvironments(project.id));
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
    throw {
      status: 400,
      message: `Unknown environment provided ${envName}, availables: ${envs.map(
        (e: any) => e.name
      )}`,
    };
  }

  return env;
};

const listEnvironments = async (projectId: string): Promise<any> => {
  const url = `https://${process.env.BAMBOO_HOST_URL}/rest/api/latest/deploy/project/${projectId}`;
  const { data, status, statusText } = await axiosGet(url, {
    headers: {
      Authorization: `Bearer ${process.env.BAMBOO_API_TOKEN}`,
    },
  });

  return data.environments
    .filter(
      (e: any) =>
        e.operations.canView &&
        e.operations.allowedToExecute &&
        e.configurationState === "TASKED"
    )
    .map((e: any) => ({
      id: e.id,
      name: e.name,
      canExecute: e.operations.canExecute,
    }));
};

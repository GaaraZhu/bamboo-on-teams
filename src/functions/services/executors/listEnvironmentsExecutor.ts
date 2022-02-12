import { getDeploymentProject } from "./listDeploymentProjectsExecutor";
import { ListEnvironmentsAction } from "../../models/listEnvironmentsAction";
import { axiosGet } from "../axiosService";
import { isInvalidProdEnv } from "../../utils";

export const executeListEnvironmentsCommand = async (
  action: ListEnvironmentsAction
): Promise<any> => {
  const project = await getDeploymentProject(action.deploymentProject);
  return await listEnvironments(project.id);
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
  const { data } = await axiosGet(url, {
    headers: {
      Authorization: `Bearer ${process.env.BAMBOO_API_TOKEN}`,
    },
  });

  return data.environments
    .filter(
      (e: any) =>
        e.operations.canView &&
        !isInvalidProdEnv(e.name) &&
        e.configurationState === "TASKED"
    )
    .map((e: any) => ({
      id: e.id,
      name: e.name,
      allowedToExecute: e.operations.allowedToExecute,
    }));
};

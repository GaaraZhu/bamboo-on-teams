import { getDeploymentProject } from "./listDeploymentProjectsExecutor";
import { ListEnvironmentsAction } from "../../models/listEnvironmentsAction";
import { axiosGet } from "../axiosService";
import { getConfig } from "../config";

export const executeListEnvironmentsCommand = async (
  action: ListEnvironmentsAction
): Promise<Env[]> => {
  const project = await getDeploymentProject(action.deploymentProject);
  return await listEnvironments(project.id);
};

export const getEnvironment = async (
  projectId: string,
  envName: string
): Promise<Env> => {
  const envs = await listEnvironments(projectId);
  const env = envs.find(
    (e: Env) => e.name.toUpperCase() === envName.toUpperCase()
  );
  if (!env) {
    throw {
      status: 400,
      message: `Unknown environment provided ${envName}, availables: ${envs.map(
        (e: Env) => e.name
      )}`,
    };
  }

  return env;
};

/**
 *
 * @param projectId deployment project id
 * @returns a list of available environments
 *
 * Note: no filtering by operation permissions
 */
const listEnvironments = async (projectId: string): Promise<Env[]> => {
  const url = `https://${
    getConfig().bambooHostUrl
  }/rest/api/latest/deploy/project/${projectId}`;
  const { data } = await axiosGet(url, {
    headers: {
      Authorization: `Bearer ${getConfig().bambooAPIToken}`,
    },
  });

  return data.environments
    .filter((e: any) => e.configurationState === "TASKED")
    .map((e: any) => ({
      id: e.id,
      name: e.name,
      operations: {
        canView: e.operations.canView,
        canExecute: e.operations.canExecute,
        allowedToExecute: e.operations.allowedToExecute,
      },
    }));
};

/**
 * expose only useful operations here
 */
export interface Env {
  id: string;
  name: string;
  operations: Operations;
}

export interface Operations {
  canView: boolean;
  canExecute: boolean;
  allowedToExecute: boolean;
}

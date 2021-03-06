import { ListDeploymentProjectsAction } from "../../models/listDeploymentProjects";
import { axiosGet } from "../axiosService";
import { getConfig } from "../config";

export const executeListDeploymentProjectsCommand = async (
  action: ListDeploymentProjectsAction
): Promise<any> => {
  return (await listDeploymentProjects()).map((p: any) => p.name);
};

export const getDeploymentProject = async (
  projectName: string
): Promise<any> => {
  const projects = await listDeploymentProjects();
  const project = projects.find(
    (p: any) => p.name.toUpperCase() === projectName.toUpperCase()
  );
  if (!project) {
    throw {
      status: 400,
      message: `Unknown project provided ${projectName}, available plans: ${projects.map(
        (p: any) => p.name
      )}`,
    };
  }

  return project;
};

export const getDeploymentProjectById = async (id: string): Promise<any> => {
  const url = `https://${
    getConfig().bambooHostUrl
  }/rest/api/latest/deploy/project/${id}`;
  const { data } = await axiosGet(url, {
    headers: {
      Authorization: `Bearer ${getConfig().bambooAPIToken}`,
    },
  });

  return data;
};

export const listDeploymentProjects = async (): Promise<any> => {
  const url = `https://${
    getConfig().bambooHostUrl
  }/rest/api/latest/deploy/project/all`;
  const { data } = await axiosGet(url, {
    headers: {
      Authorization: `Bearer ${getConfig().bambooAPIToken}`,
    },
  });

  return data
    .map((p: any) => ({
      id: p.id,
      name: p.name.replace(/ +/g, "-"),
    }))
    .sort();
};

import { Response } from "lambda-api";
import { ListDeploymentProjectsAction } from "../../models/listDeploymentProjects";
import { axiosGet } from "../axiosService";

export const executeListDeploymentProjectsCommand = async (
  action: ListDeploymentProjectsAction,
  response: Response
): Promise<void> => {
  response
    .status(200)
    .json((await listDeploymentProjects()).map((p: any) => p.name));
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

export const listDeploymentProjects = async (): Promise<any> => {
  const url = `https://${process.env.BAMBOO_HOST_URL}/rest/api/latest/deploy/project/all`;
  const { data, status, statusText } = await axiosGet(url, {
    headers: {
      Authorization: `Bearer ${process.env.BAMBOO_API_TOKEN}`,
    },
  });

  return data
    .map((p: any) => ({
      id: p.id,
      name: p.name.replace(/ +/g, "-"),
    }))
    .sort();
};

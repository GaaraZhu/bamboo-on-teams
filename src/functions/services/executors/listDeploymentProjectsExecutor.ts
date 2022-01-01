import { Response } from "lambda-api";
import axios from "axios";
import { ListProjectsAction } from "../../models/listDeploymentProjects";

export const executeListDeploymentProjects = async (
  action: ListProjectsAction,
  response: Response
): Promise<void> => {
  response.status(200).json((await listProjects()).map((p: any) => p.name));
};

export const getProject = async (projectName: string): Promise<any> => {
  const projects = await listProjects();
  const project = projects.find(
    (p: any) => p.name.toUpperCase() === projectName.toUpperCase()
  );
  if (!project) {
    throw Error(
      `Unknow project name provided ${projectName}, available plans: ${projects.map(
        (p: any) => p.name
      )}`
    );
  }

  return project;
};

const listProjects = async (): Promise<any> => {
  const url = `https://${process.env.BAMBOO_HOST_URL}/rest/api/latest/deploy/project/all`;
  const { data } = await axios.get(url, {
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

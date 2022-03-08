import { SearchProjectsAction } from "../../models/searchProjectsAction";
import { listDeploymentProjects } from "./listDeploymentProjectsExecutor";

export const executeSearchProjectsCommand = async (
  action: SearchProjectsAction
): Promise<any> => {
  return (await searchProjects(action.deploymentProject)).map(
    (p: any) => p.name
  );
};

export const searchProjects = async (projectName: string): Promise<any> => {
  const projects = await listDeploymentProjects();
  const result = projects.filter((p: any) =>
    p.name.toUpperCase().includes(projectName.toUpperCase())
  );

  return result;
};

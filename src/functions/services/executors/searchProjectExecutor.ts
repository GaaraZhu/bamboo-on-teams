import { SearchProjectAction } from "../../models/searchProjectAction";
import { listDeploymentProjects } from "./listDeploymentProjectsExecutor";

export const executeSearchProjectCommand = async (
  action: SearchProjectAction
): Promise<any> => {
  return (await getDeploymentProject(action.deploymentProject)).map((p: any) => p.name);
};

export const getDeploymentProject = async (
  projectName: string
): Promise<any> => {
  const projects = await listDeploymentProjects();
  const project = projects.filter(
    (p: any) => p.name.toUpperCase().includes(projectName.toUpperCase())
  );

  return project;
};

import { Response } from "lambda-api";
import axios from "axios";
import { ListReleasesAction } from "../../models/listReleasesAction";
import { getDeploymentProject } from "./listDeploymentProjectsExecutor";

export const executeListReleasesCommand = async (
  action: ListReleasesAction,
  response: Response
): Promise<void> => {
  const project = await getDeploymentProject(action.deploymentProject);
  response.status(200).json(await listReleases(project.id, action.planBranch));
};

const listReleases = async (
  projectId: string,
  branch: string
): Promise<any> => {
  const url = `https://${process.env.BAMBOO_HOST_URL}/rest/api/latest/deploy/project/${projectId}/versions`;
  const { data } = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${process.env.BAMBOO_API_TOKEN}`,
    },
  });

  return data.versions
    .filter((r: any) => r.planBranchName.toUpperCase() === branch.toUpperCase())
    .map((r: any) => ({
      id: r.id,
      name: r.name,
      planBranchName: r.planBranchName,
      creationDate: new Date(r.creationDate).toLocaleString(),
    }));
};

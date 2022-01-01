import { Response } from "lambda-api";
import axios from "axios";
import { ListReleasesAction } from "../../models/listReleasesAction";
import { getDeploymentProject } from "./listDeploymentProjectsExecutor";

export const executeListReleasesCommand = async (
  action: ListReleasesAction,
  response: Response
): Promise<void> => {
  const project = await getDeploymentProject(action.deploymentProject);
  response
    .status(200)
    .json(await listBranchReleases(project.id, action.planBranch));
};

export const getRelease = async (
  projectId: string,
  releaseName: string
): Promise<any> => {
  const releases = await listReleases(projectId);
  const release = releases.find(
    (r: any) => r.name.toUpperCase() === releaseName.toUpperCase()
  );
  if (!release) {
    throw Error(
      `Unknow release name provided ${releaseName}, available plans: ${releases.map(
        (e: any) => e.name
      )}`
    );
  }

  return release;
};

const listBranchReleases = async (
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

const listReleases = async (projectId: string): Promise<any> => {
  const url = `https://${process.env.BAMBOO_HOST_URL}/rest/api/latest/deploy/project/${projectId}/versions`;
  const { data } = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${process.env.BAMBOO_API_TOKEN}`,
    },
  });

  return data.versions.map((r: any) => ({
    id: r.id,
    name: r.name,
    planBranchName: r.planBranchName,
    creationDate: new Date(r.creationDate).toLocaleString(),
  }));
};

import { ListReleasesAction } from "../../models/listReleasesAction";
import { axiosGet } from "../axiosService";
import { getConfig } from "../config";
import { getDeploymentProject } from "./listDeploymentProjectsExecutor";

export const executeListReleasesCommand = async (
  action: ListReleasesAction
): Promise<any> => {
  const project = await getDeploymentProject(action.deploymentProject);
  return (await listReleases(project.id)).filter(
    (r: any) =>
      r.planBranchName.toUpperCase() === action.planBranch.toUpperCase()
  );
};

export const getRelease = async (
  projectId: string,
  releaseName: string
): Promise<any> => {
  const versions = await listReleases(projectId);
  const version = versions?.find(
    (v: any) => v.name.toUpperCase() === releaseName.toUpperCase()
  );

  if (!version) {
    throw {
      status: 400,
      message: `Unknown release provided ${releaseName}, available versions: ${versions.map(
        (v: any) => v.name
      )}`,
    };
  }

  return version;
};

const listReleases = async (projectId: string): Promise<any> => {
  const url = `https://${
    getConfig().bambooHostUrl
  }/rest/api/latest/deploy/project/${projectId}/versions`;
  const { data } = await axiosGet(url, {
    headers: {
      Authorization: `Bearer ${getConfig().bambooAPIToken}`,
    },
  });

  return data.versions.map((r: any) => ({
    id: r.id,
    name: r.name,
    planBranchName: r.planBranchName,
    creationDate: r.creationDate
      ? new Date(r.creationDate).toLocaleString()
      : "",
  }));
};

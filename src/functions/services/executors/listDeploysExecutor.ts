import { ListDeploysAction } from "../../models/listDeploysAction";
import { viewOperationCheck } from "../../utils";
import { axiosGet } from "../axiosService";
import { getConfig } from "../config";
import { getDeploymentProject } from "./listDeploymentProjectsExecutor";
import { getEnvironment } from "./listEnvironmentsExecutor";

export const executeListDeploysCommand = async (
  action: ListDeploysAction
): Promise<any> => {
  const project = await getDeploymentProject(action.deploymentProject);
  const environment = await getEnvironment(project.id, action.env);
  viewOperationCheck(environment.operations);
  return await listDeploys(environment.id);
};

export const getDeploy = async (id: string): Promise<Deploy> => {
  const url = `https://${
    getConfig().bambooHostUrl
  }/rest/api/latest/deploy/result/${id}`;
  const { data } = await axiosGet(url, {
    headers: {
      Authorization: `Bearer ${getConfig().bambooAPIToken}`,
    },
  });

  return data;
};

export interface Deploy {
  id: string;
  lifeCycleState: string;
  deploymentState: string;
  finishedDate: string;
  deploymentVersionName: string;
}

export const listDeploys = async (environmentId: string): Promise<any> => {
  const url = `https://${
    getConfig().bambooHostUrl
  }/rest/api/latest/deploy/environment/${environmentId}/results?max-results=3`;
  const { data } = await axiosGet(url, {
    headers: {
      Authorization: `Bearer ${getConfig().bambooAPIToken}`,
    },
  });

  return data.results?.map((r: any) => ({
    release: {
      id: r.deploymentVersion?.id,
      name: r.deploymentVersion.name,
    },
    deploymentState: r.deploymentState,
    lifeCycleState: r.lifeCycleState,
    startedDate: r.startedDate ? new Date(r.startedDate).toLocaleString() : "",
    finishedDate: r.finishedDate
      ? new Date(r.finishedDate).toLocaleString()
      : "",
  }));
};

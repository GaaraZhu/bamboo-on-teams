import { Response } from "lambda-api";
import axios from "axios";
import { ListDeploysAction } from "../../models/listDeploysAction";
import { getDeploymentProject } from "./listDeploymentProjectsExecutor";
import { getEnvironment } from "./listEnvironmentsExecutor";

export const executeListDeploysCommand = async (
  action: ListDeploysAction,
  response: Response
): Promise<void> => {
  const project = await getDeploymentProject(action.deploymentProject);
  const environment = await getEnvironment(project.id, action.env);
  response.status(200).json(await listDeploys(environment.id));
};

export const listDeploys = async (environmentId: string): Promise<any> => {
  const url = `https://${process.env.BAMBOO_HOST_URL}/rest/api/latest/deploy/environment/${environmentId}/results`;
  const { data } = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${process.env.BAMBOO_API_TOKEN}`,
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
    agent: r.agent.name,
  }));
};

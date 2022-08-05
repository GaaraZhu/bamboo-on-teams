import { getDeploymentProject } from "./listDeploymentProjectsExecutor";
import { getEnvironment } from "./listEnvironmentsExecutor";
import { deployRelease } from "./deployReleaseExecutor";
import { createRelease } from "./createReleaseExecutor";
import { executeOperationCheck, prodEnvCheck } from "../../utils";
import { axiosGet } from "../axiosService";
import { DeployBuildAction } from "../../models/deployBuildAction";
import { getBuild } from "./descBuildExecutor";
import {
  CheckerInputType,
  DeployBuildJobCheckerInput,
} from "../../api/handlers/statusChecker";
import { DeployResult } from "./deployLatestBuildExecutor";
import { startCheckerExecution } from "../stepFunctionService";
import { getConfig } from "../config";

export const executeDeployBuildCommand = async (
  action: DeployBuildAction
): Promise<any> => {
  // 1. check prod environment availability
  prodEnvCheck(action.env, action.triggeredBy);

  // 2. get the build
  const build = await getBuild(action.buildKey);

  // 3. get all releases for the service branch
  const project = await getDeploymentProject(action.service);
  const buildReleases = await getBuildReleases(project.id, build.branch.key);

  // 4. create a release if not exist for the build
  let targetRelease = buildReleases?.find((r: any) =>
    r.items.find((i: any) => i.planResultKey.key === build.key)
  );
  if (!targetRelease) {
    let releaseName = `${build.branch.name}-1`;
    const releasePrefixedWithBranch = buildReleases?.find((r: any) =>
      r.name.toUpperCase().startsWith(build.branch.name.toUpperCase() + "-")
    );
    if (releasePrefixedWithBranch) {
      const lastDashIndex = releasePrefixedWithBranch.name.lastIndexOf("-");
      releaseName = `${releasePrefixedWithBranch.name.substring(
        0,
        lastDashIndex
      )}-${+releasePrefixedWithBranch.name.substring(lastDashIndex + 1) + 1}`;
    }

    targetRelease = await createRelease(project.id, build.key, releaseName);
  }

  // 5. deploy the release to the environment
  const env = await getEnvironment(project.id, action.env);
  executeOperationCheck(env.operations);
  const deployment = await deployRelease(env, targetRelease.id);

  const deployResult: DeployResult = {
    service: action.service,
    branch: build.branch.name,
    environment: action.env,
    build: {
      buildNumber: build.buildNumber,
      buildRelativeTime: build.buildRelativeTime,
      release: targetRelease.name,
    },
    deployment: {
      id: deployment.deploymentResultId,
      link: deployment.link.href,
    },
  };

  // 6. start async job status checker and push the result to MS Teams
  const checkerInput: DeployBuildJobCheckerInput = {
    type: CheckerInputType.DEPLOY_BUILD,
    resultKey: deployment.deploymentResultId,
    resultUrl: deployment.link.href,
    service: action.service,
    branch: build.branch.name,
    buildNumber: build.buildNumber,
    environment: action.env,
    triggeredBy: action.triggeredBy,
  };
  await startCheckerExecution(deployment.deploymentResultId, checkerInput);

  return deployResult;
};

export const getBuildReleases = async (
  projectId: string,
  branchName: string
): Promise<any> => {
  const url = `https://${
    getConfig().bambooHostUrl
  }/rest/api/latest/deploy/project/${projectId}/versions?planBranchName=${branchName}`;
  const { data } = await axiosGet(url, {
    headers: {
      Authorization: `Bearer ${getConfig().bambooAPIToken}`,
    },
  });

  return data.versions;
};

export const getLatestSuccessBuild = async (
  branchKey: string
): Promise<any> => {
  const url = `https://${
    getConfig().bambooHostUrl
  }/rest/api/latest/result/${branchKey}?buildstate=Successful&max-results=1&expand=results.result`;
  const { data } = await axiosGet(url, {
    headers: {
      Authorization: `Bearer ${getConfig().bambooAPIToken}`,
    },
  });

  return data.results.result
    ? {
        key: data.results.result[0].key,
        buildNumber: data.results.result[0].buildNumber,
        buildRelativeTime: data.results.result[0].buildRelativeTime,
        vcsRevisionKey: data.results.result[0].vcsRevisionKey,
        lifeCycleState: data.results.result[0].lifeCycleState,
        buildState: data.results.result[0].buildState,
      }
    : undefined;
};

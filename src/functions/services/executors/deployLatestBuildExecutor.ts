import { getBranchByNameAndPlanKey } from "./listPlanBranchesExecutor";
import { DeployLatestBuildAction } from "../../models/deployLatestBuildAction";
import {
  getDeploymentProject,
  getDeploymentProjectById,
} from "./listDeploymentProjectsExecutor";
import { getEnvironment } from "./listEnvironmentsExecutor";
import { deployRelease } from "./deployReleaseExecutor";
import { createRelease } from "./createReleaseExecutor";
import { executeOperationCheck, prodEnvCheck, vcsBranchToBambooBranch } from "../../utils";
import { axiosGet } from "../axiosService";
import {
  CheckerInputType,
  DeployBuildJobCheckerInput,
} from "../../api/handlers/statusChecker";
import { startCheckerExecution } from "../stepFunctionService";
import { getConfig } from "../config";

export const executeDeployLatestCommand = async (
  action: DeployLatestBuildAction,
  isBatch = false
): Promise<any> => {
  // 1. check environment availability
  prodEnvCheck(action.env, action.triggeredBy);

  // 2. get the deployment project by name
  const project = await getDeploymentProject(action.service);

  // 3. get the latest build from the service branch
  const projectDetails = await getDeploymentProjectById(project.id);
  const buildPlanKey = projectDetails.planKey?.key;
  if (!buildPlanKey) {
    throw {
      status: 400,
      message: `No build plan configured for project ${action.service}`,
    };
  }

  const branch = await getBranchByNameAndPlanKey(buildPlanKey, action.branch);
  const latestBuild = await getLatestSuccessBuild(branch.key);
  if (!latestBuild) {
    throw {
      status: 400,
      message: `No success build found for service ${action.service} in branch ${action.branch}`,
    };
  }

  // 4. get all releases for the service branch
  const buildReleases = await getBuildReleases(project.id, branch.key);
  // 5. create a release if not exist for the build
  let targetRelease = buildReleases?.find((r: any) =>
    r.items.find((i: any) => i.planResultKey.key === latestBuild.key)
  );
  if (!targetRelease) {
    const bambooBranchName = vcsBranchToBambooBranch(action.branch);
    let releaseName = `${bambooBranchName}-1`;
    const releasePrefixedWithBranch = buildReleases?.find((r: any) =>
      r.name.toUpperCase().startsWith(bambooBranchName.toUpperCase() + "-")
    );
    if (releasePrefixedWithBranch) {
      const lastDashIndex = releasePrefixedWithBranch.name.lastIndexOf("-");
      releaseName = `${releasePrefixedWithBranch.name.substring(
        0,
        lastDashIndex
      )}-${+releasePrefixedWithBranch.name.substring(lastDashIndex + 1) + 1}`;
    }

    targetRelease = await createRelease(
      project.id,
      latestBuild.key,
      releaseName
    );
  }

  // 6. deploy the release to the environment
  const env = await getEnvironment(project.id, action.env);
  executeOperationCheck(env.operations);
  const deployment = await deployRelease(env, targetRelease.id);
  const deployResult: DeployResult = {
    service: action.service,
    branch: action.branch,
    environment: action.env,
    build: {
      buildNumber: latestBuild.buildNumber,
      buildRelativeTime: latestBuild.buildRelativeTime,
      vcsRevisionKey: latestBuild.vcsRevisionKey,
      release: targetRelease.name,
    },
    deployment: {
      id: deployment.deploymentResultId,
      link: deployment.link.href,
    },
  };

  // 7. start async job status checker and push the result to MS Teams
  // NOTE: batch job has its own status checking logic for final notification push
  if (!isBatch) {
    const checkerInput: DeployBuildJobCheckerInput = {
      type: CheckerInputType.DEPLOY_BUILD,
      resultKey: deployment.deploymentResultId,
      resultUrl: deployment.link.href,
      service: action.service,
      branch: action.branch,
      buildNumber: latestBuild.buildNumber,
      environment: action.env,
      triggeredBy: action.triggeredBy,
    };
    await startCheckerExecution(deployment.deploymentResultId, checkerInput);
  }

  return deployResult;
};

export const getBuildReleases = async (
  projectId: string,
  branchKey: string
): Promise<any> => {
  const url = `https://${
    getConfig().bambooHostUrl
  }/rest/api/latest/deploy/project/${projectId}/versions?branchKey=${branchKey}`;
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

  return data.results.result && data.results.result[0]
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

export interface DeployResult {
  service: string;
  branch?: string;
  environment: string;
  build: {
    buildNumber?: string;
    buildRelativeTime?: string;
    vcsRevisionKey?: string;
    release: string;
  };
  deployment: {
    id: string;
    link: string;
  };
}

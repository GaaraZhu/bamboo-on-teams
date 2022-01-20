import { Response } from "lambda-api";
import { getBranch } from "./listPlanBranchesExecutor";
import { DeployLatestBuildAction } from "../../models/deployLatestBuildAction";
import { getDeploymentProject } from "./listDeploymentProjectsExecutor";
import { getEnvironment } from "./listEnvironmentsExecutor";
import { deployRelease } from "./deployReleaseExecutor";
import { createRelease } from "./createReleaseExecutor";
import { prodEnvCheck, startChecker } from "../../utils";
import { axiosGet } from "../axiosService";
import { JobType } from "../../models/actions";

export const executeDeployLatestCommand = async (
  action: DeployLatestBuildAction,
  response: Response
): Promise<void> => {
  // 1. check environment availability
  prodEnvCheck(action.env);

  // get the latest build from the service branch
  const branch = await getBranch(action.service, action.branch);
  const latestBuild = await getLatestSuccessBuild(branch.key);
  if (!latestBuild) {
    response.status(400).json({
      message: `No success build found for service ${action.service} in branch ${action.branch}`,
    });
    return;
  }

  // get all releases for the service branch
  const project = await getDeploymentProject(action.service);
  const buildReleases = await getBuildReleases(project.id, action.branch);

  // create a release if not exist for the build
  let targetRelease = buildReleases?.find((r: any) =>
    r.items.find((i: any) => i.planResultKey.key === latestBuild.key)
  );
  if (!targetRelease) {
    let releaseName = `${action.branch}-1`;
    const releasePrefixedWithBranch = buildReleases?.find((r: any) =>
      r.name.toUpperCase().startsWith(action.branch.toUpperCase() + "-")
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

  // deploy the release to the environment
  const env = await getEnvironment(project.id, action.env);
  const deployment = await deployRelease(env.id, targetRelease.id);
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
  response.status(200).json(deployResult);
  await startChecker(
    deployResult,
    JobType.DEPLOYMENT,
    action.service,
    action.branch,
    action.triggeredBy
  );
};

export const getBuildReleases = async (
  projectId: string,
  branchName: string
): Promise<any> => {
  const url = `https://${process.env.BAMBOO_HOST_URL}/rest/api/latest/deploy/project/${projectId}/versions?planBranchName=${branchName}`;
  const { data } = await axiosGet(url, {
    headers: {
      Authorization: `Bearer ${process.env.BAMBOO_API_TOKEN}`,
    },
  });

  return data.versions;
};

export const getLatestSuccessBuild = async (
  branchKey: string
): Promise<any> => {
  const url = `https://${process.env.BAMBOO_HOST_URL}/rest/api/latest/result/${branchKey}?buildstate=Successful&max-results=1&expand=results.result`;
  const { data } = await axiosGet(url, {
    headers: {
      Authorization: `Bearer ${process.env.BAMBOO_API_TOKEN}`,
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

export interface DeployResult {
  service: string;
  branch: string;
  environment: string;
  build: {
    buildNumber: string;
    buildRelativeTime: string;
    vcsRevisionKey?: string;
    release: string;
  };
  deployment: {
    id: string;
    link: string;
  };
}

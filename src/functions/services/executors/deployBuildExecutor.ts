import { Response } from "lambda-api";
import axios from "axios";
import { getDeploymentProject } from "./listDeploymentProjectsExecutor";
import { getEnvironment } from "./listEnvironmentsExecutor";
import { deployRelease } from "./deployReleaseExecutor";
import { createRelease } from "./createReleaseExecutor";
import { prodEnvCheck } from "../../utils";
import { DeployBuildAction } from "../../models/deployBuildAction";
import { getBuild } from "./descBuildExecutor";

export const executeDeployBuildCommand = async (
  action: DeployBuildAction,
  response: Response
): Promise<void> => {
  // 1. check environment availability
  prodEnvCheck(action.env);

  // get the build
  const build = await getBuild(action.buildKey);

  // get all releases for the service branch
  const project = await getDeploymentProject(action.service);
  const buildReleases = await getBuildReleases(project.id, build.branch.key);

  // create a release if not exist for the build
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

  // deploy the release to the environment
  const env = await getEnvironment(project.id, action.env);
  const deployment = await deployRelease(env.id, targetRelease.id);

  response.status(200).json({
    service: action.service,
    branch: build.branch.name,
    build: build,
    environment: action.env,
    deployment: {
      id: deployment.deploymentResultId,
      link: deployment.link.href,
    },
  });
};

export const getBuildReleases = async (
  projectId: string,
  branchName: string
): Promise<any> => {
  const url = `https://${process.env.BAMBOO_HOST_URL}/rest/api/latest/deploy/project/${projectId}/versions?planBranchName=${branchName}`;
  const { data } = await axios.get(url, {
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
  const { data } = await axios.get(url, {
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
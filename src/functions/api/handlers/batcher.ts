import { ActionName } from "../../models/actions";
import { BuildAction } from "../../models/buildAction";
import { CreateBranchAction } from "../../models/createBranchAction";
import { DeployLatestBuildAction } from "../../models/deployLatestBuildAction";
import { PromoteDeployAction } from "../../models/promoteDeployAction";
import { CommandParser } from "../../services/commandParser";
import { executeBuildCommand } from "../../services/executors/buildExecutor";
import { executeCreateBranchCommand } from "../../services/executors/createPlanBranchExecutor";
import {
  DeployResult,
  executeDeployLatestCommand,
} from "../../services/executors/deployLatestBuildExecutor";
import {
  Build,
  getBuild,
  getLatestBuild,
} from "../../services/executors/descBuildExecutor";
import { BuildResult } from "../../services/executors/listBuildsExecutor";
import {
  Deploy,
  getDeploy,
} from "../../services/executors/listDeploysExecutor";
import { executePromoteDeployCommand } from "../../services/executors/promoteDeployExecutor";
import {
  BatchNotificationInput,
  sendAllBuildsNotification,
  sendAllDeploysNotification,
  sendBuildAndDeployNotification,
  sendBuildNotification,
  sendDeployBuildNotification,
  sendReleaseFailedNotification,
} from "../../services/notificationService";
import { BuildCommand } from "../../services/stepFunctionService";
import {
  checkBuildStatus,
  checkDeployStatus,
  getJobPageUrl,
} from "./statusChecker";

// execute single task for batch-build, batch-deploy, release or promote-release actions
export const executeSingle = async (event: any, context: any): Promise<any> => {
  console.log(`executeSingle: ${JSON.stringify(event)}`);
  try {
    if (event.targetEnv) {
      // promote-deploy operation
      const promoteDeployAction = (await CommandParser.build().parse(
        event.command,
        event.triggeredBy
      )) as PromoteDeployAction;
      return await executePromoteDeployCommand(promoteDeployAction, true);
    } else if (event.environment) {
      // deploy operation
      const deployAction = (await CommandParser.build().parse(
        event.command,
        event.triggeredBy
      )) as DeployLatestBuildAction;
      return await executeDeployLatestCommand(deployAction, true);
    } else if (event.vcsBranch) {
      // create branch operation
      const createBranchAction = (await CommandParser.build().parse(
        event.command,
        event.triggeredBy
      )) as CreateBranchAction;
      return await executeCreateBranchCommand(createBranchAction, true);
    } else {
      // build operation
      const buildAction = (await CommandParser.build().parse(
        event.command,
        event.triggeredBy
      )) as BuildAction;
      return await executeBuildCommand(buildAction, true);
    }
  } catch (err: any) {
    console.log(`executeSingle: ${JSON.stringify(err)}`);
    throw `${event.service}: ${err.message}`;
  }
};

export const checkSingle = async (event: any, context: any): Promise<any> => {
  console.log(`checkSingle: ${JSON.stringify(event)}`);
  if (event.vcsBranch) {
    // create branch operation
    const build = await getLatestBuild(event.triggerResult.key);
    checkBuildStatus(build);
    return build;
  } else if (event.environment || event.targetEnv) {
    // deploy or promote-deploy operation
    const result: DeployResult = event.triggerResult;
    const deploy = await getDeploy(result.deployment.id);
    checkDeployStatus(deploy);
    return deploy;
  } else {
    // build operation
    const result: BuildResult = event.triggerResult;
    const build = await getBuild(result.buildResultKey);
    checkBuildStatus(build);
    return build;
  }
};

export const notifySingle = async (event: any, context: any): Promise<any> => {
  console.log(`notifySingle: ${JSON.stringify(event)}`);
  // failure notification
  if (event.error?.Cause) {
    let errorMessage = undefined;
    try {
      errorMessage = JSON.parse(event.error?.Cause)?.errorMessage;
    } catch (err: any) {
      errorMessage = event.error?.Cause;
      console.log(`failed to parse error cause: ${event.error?.Cause}`);
    }

    if (event.targetEnv || event.environment) {
      // promote release operation or batch deploy or release operation
      await sendDeployBuildNotification(
        event.service,
        event.targetEnv || event.environment,
        "FAILED",
        event.triggeredBy,
        undefined,
        errorMessage
      );
    } else {
      // batch build/create-branch operation
      await sendBuildNotification(
        event.service,
        event.branch || event.target.branch.name,
        "FAILED",
        event.triggeredBy,
        undefined,
        errorMessage
      );
    }
    return;
  }

  // execution result notification
  if (event.targetEnv || event.environment) {
    // promote release operation
    const result: DeployResult = event.triggerResult;
    const deploy: Deploy = event.target;
    await sendDeployBuildNotification(
      event.service,
      event.targetEnv || event.environment,
      deploy.deploymentState,
      event.triggeredBy,
      getJobPageUrl(result.deployment.id, false)
    );
  } else {
    // batch build/create-branch operation
    const result: BuildResult = event.triggerResult;
    const build: Build = event.target;
    await sendBuildNotification(
      event.service,
      event.branch || event.target.branch.name,
      build.buildState,
      event.triggeredBy,
      getJobPageUrl(build.key, true)
    );
  }
};

// final notification for build-and-deploy, batch-build or batch-deploy actions
export const notifyAll = async (event: any, context: any): Promise<void> => {
  console.log(`notifyAll: ${JSON.stringify(event)}`);

  // batch build and deploy operation
  if (
    event.length > 1 &&
    event[0]?.length === 2 &&
    event[0][0].command?.toLowerCase().trim().startsWith(ActionName.BUILD) &&
    event[0][1].command?.toLowerCase().trim().startsWith(ActionName.DEPLOY)
  ) {
    console.log("notifyAll for batch buld and deploy opeartion");

    const services = event.map((e: any) => {
      const buildCommand = e[0];
      const deployCommand = e[1];
      const isBuildSuccess = ["SUCCESS", "SUCCESSFUL"].includes(
        buildCommand.target?.buildState?.toUpperCase()
      );
      return {
        service: buildCommand.service,
        buildStatus: buildCommand.target.buildState || "FAILED",
        deployStatus: isBuildSuccess
          ? deployCommand.target?.deploymentState || "FAILED"
          : "NOT-STARTED",
      };
    });
    await sendBuildAndDeployNotification({
      services: services,
      branch: event[0][0].branch,
      environment: event[0][1].environment,
      triggeredBy: event[0][0].triggeredBy,
    });
    return;
  }

  // build and deploy operation
  if (
    event.length === 2 &&
    event[0].command.toLowerCase().trim().startsWith(ActionName.BUILD) &&
    event[1].command.toLowerCase().trim().startsWith(ActionName.DEPLOY)
  ) {
    console.log("notifyAll for buld and deploy opeartion");
    const buildCommand = event[0];
    const deployCommand = event[1];
    const isBuildSuccess = ["SUCCESS", "SUCCESSFUL"].includes(
      buildCommand.target?.buildState?.toUpperCase()
    );
    await sendBuildAndDeployNotification({
      services: [
        {
          service: buildCommand.service,
          buildStatus: buildCommand.target.buildState || "FAILED",
          deployStatus: isBuildSuccess
            ? deployCommand.target?.deploymentState || "FAILED"
            : "NOT-STARTED",
        },
      ],
      branch: buildCommand.branch,
      environment: deployCommand.environment,
      triggeredBy: buildCommand.triggeredBy,
    });
    return;
  }

  // batch operation
  const firstCommand = event[0]; // BuildCommand or DeployLatestCommand
  const input: BatchNotificationInput = {
    services: event.map((c: any) => ({
      service: c.service,
      status: c.error
        ? "FAILED"
        : c.target.buildState || c.target.deploymentState,
    })),
    branch: firstCommand.branch,
    environment: firstCommand.environment,
    triggeredBy: firstCommand.triggeredBy,
  };
  if (firstCommand.environment) {
    // batch deploy operation
    await sendAllDeploysNotification(input);
  } else if (firstCommand.vcsBranch) {
    // batch create branch operation
    await sendAllBuildsNotification(
      input,
      "Bamboo batch create branch job finished"
    );
  } else {
    // batch build operation
    await sendAllBuildsNotification(input);
  }
};

// final notification for release or promote-release actions
export const notifyRelease = async (event: any, context: any): Promise<any> => {
  console.log(`notifyRelease: ${JSON.stringify(event)}`);
  if (event.error?.Cause) {
    let errorMessage = undefined;
    try {
      errorMessage = JSON.parse(event.error?.Cause)?.errorMessage;
    } catch (err: any) {
      errorMessage = event.error?.Cause;
      console.log(`failed to parse error cause: ${event.error?.Cause}`);
    }
    await sendReleaseFailedNotification(
      errorMessage,
      event.batches[0].commands[0].environment,
      event.batches[0].commands[0].triggeredBy
    );
    return;
  }

  const firstCommand = event[0][0]; // DeployLatestCommand or PromoteDeployCommand
  const input: BatchNotificationInput = {
    services: event.flat().map((c: any) => ({
      service: c.service,
      status: c.error ? "FAILED" : c.target?.deploymentState || "NOT-STARTED",
    })),
    branch: firstCommand.branch,
    environment: firstCommand.targetEnv || firstCommand.environment,
    triggeredBy: firstCommand.triggeredBy,
  };
  await sendAllDeploysNotification(input, "Bamboo release job finished");
};

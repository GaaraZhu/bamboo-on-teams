import { BuildAction } from "../../models/buildAction";
import { DeployLatestBuildAction } from "../../models/deployLatestBuildAction";
import { PromoteDeployAction } from "../../models/promoteDeployAction";
import { CommandParser } from "../../services/commandParser";
import {
  BuildResult,
  executeBuildCommand,
} from "../../services/executors/buildExecutor";
import {
  DeployResult,
  executeDeployLatestCommand,
} from "../../services/executors/deployLatestBuildExecutor";
import { Build, getBuild } from "../../services/executors/descBuildExecutor";
import {
  Deploy,
  getDeploy,
} from "../../services/executors/listDeploysExecutor";
import { executePromoteDeployCommand } from "../../services/executors/promoteDeployExecutor";
import {
  BatchNotificationInput,
  sendAllBuildsNotification,
  sendAllDeploysNotification,
  sendBuildNotification,
  sendDeployBuildNotification,
  sendReleaseFailedNotification,
} from "../../services/notificationService";
import {
  BuildCommand,
  DeployLatestCommand,
  PromoteDeployCommand,
  SingleCommand,
} from "../../services/stepFunctionService";
import { getJobPageUrl, JobNotFinished } from "./statusChecker";

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
      // deploy-latest operation
      const deployAction = (await CommandParser.build().parse(
        event.command,
        event.triggeredBy
      )) as DeployLatestBuildAction;
      return await executeDeployLatestCommand(deployAction, true);
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
    throw err.message;
  }
};

export const checkSingle = async (event: any, context: any): Promise<any> => {
  console.log(`checkSingle: ${JSON.stringify(event)}`);
  if (event.environment || event.targetEnv) {
    // deploy or promote-deploy operation
    const result: DeployResult = event.triggerResult;
    const deploy = await getDeploy(result.deployment.id);
    if ("FINISHED" !== deploy.lifeCycleState.toUpperCase()) {
      throw new JobNotFinished();
    }
    return deploy;
  } else {
    // build operation
    const result: BuildResult = event.triggerResult;
    const build = await getBuild(result.buildResultKey);
    if (
      !["FINISHED", "NOTBUILT"].includes(build?.lifeCycleState?.toUpperCase())
    ) {
      throw new JobNotFinished();
    }
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
      // batch build operation
      const singleBuildCommand = event as BuildCommand;
      await sendBuildNotification(
        singleBuildCommand.service,
        singleBuildCommand.branch,
        "FAILED",
        singleBuildCommand.triggeredBy,
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
    // batch build operation
    const result: BuildResult = event.triggerResult;
    const build: Build = event.target;
    await sendBuildNotification(
      event.service,
      event.branch,
      build.buildState,
      event.triggeredBy,
      getJobPageUrl(result.buildResultKey, true)
    );
  }
};

// final notification for batch-build or batch-deploy actions
export const notifyAll = async (event: any, context: any): Promise<any> => {
  console.log(`notifyAll: ${JSON.stringify(event)}`);
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

import { BuildAction } from "../../models/buildAction";
import { DeployLatestBuildAction } from "../../models/deployLatestBuildAction";
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
import {
  BatchNotificationInput,
  sendAllBuildsNotification,
  sendAllDeploysNotification,
  sendBuildNotification,
  sendDeployBuildNotification,
  sendReleaseFailedNotification,
} from "../../services/notificationService";
import { SingleCommand } from "../../services/stepFunctionService";
import { getJobPageUrl, JobNotFinished } from "./statusChecker";

export const executeSingle = async (event: any, context: any): Promise<any> => {
  console.log(`executeSingle: ${JSON.stringify(event)}`);
  try {
    if (event.environment) {
      // batch deploy operation
      const deployAction = (await CommandParser.build().parse(
        event.command,
        event.triggeredBy
      )) as DeployLatestBuildAction;
      return await executeDeployLatestCommand(deployAction, true);
    } else {
      // batch build operation
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
  if (event.environment) {
    // batch deploy operation
    const result: DeployResult = event.triggerResult;
    const deploy = await getDeploy(result.deployment.id);
    if ("FINISHED" !== deploy.lifeCycleState.toUpperCase()) {
      throw new JobNotFinished();
    }
    return deploy;
  } else {
    // batch build operation
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
  const singleDeployCommand = event as SingleCommand;
  if (event.error?.Cause) {
    let errorMessage = undefined;
    try {
      errorMessage = JSON.parse(event.error?.Cause)?.errorMessage;
    } catch (err: any) {
      errorMessage = event.error?.Cause;
      console.log(`failed to parse error cause: ${event.error?.Cause}`);
    }
    if (event.environment) {
      // batch deploy operation
      await sendDeployBuildNotification(
        singleDeployCommand.service,
        singleDeployCommand.environment!,
        "FAILED",
        singleDeployCommand.triggeredBy,
        undefined,
        errorMessage
      );
    } else {
      // batch build operation
      await sendBuildNotification(
        singleDeployCommand.service,
        singleDeployCommand.branch,
        "FAILED",
        singleDeployCommand.triggeredBy,
        undefined,
        errorMessage
      );
    }
    return;
  }

  // execution result notification
  if (event.environment) {
    // batch deploy operation
    const result: DeployResult = event.triggerResult;
    const deploy: Deploy = event.target;
    await sendDeployBuildNotification(
      singleDeployCommand.service,
      singleDeployCommand.environment!,
      deploy.deploymentState,
      singleDeployCommand.triggeredBy,
      getJobPageUrl(result.deployment.id, false)
    );
  } else {
    // batch build operation
    const result: BuildResult = event.triggerResult;
    const build: Build = event.target;
    await sendBuildNotification(
      singleDeployCommand.service,
      singleDeployCommand.branch,
      build.buildState,
      singleDeployCommand.triggeredBy,
      getJobPageUrl(result.buildResultKey, true)
    );
  }
};

export const notifyAll = async (event: any, context: any): Promise<any> => {
  console.log(`notifyAll: ${JSON.stringify(event)}`);
  const firstCommand: SingleCommand = event[0];
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

  const firstCommand: SingleCommand = event[0][0];
  const input: BatchNotificationInput = {
    services: event.flat().map((c: any) => ({
      service: c.service,
      status: c.error
        ? "FAILED"
        : c.target?.buildState || c.target?.deploymentState || "NOT-STARTED",
    })),
    branch: firstCommand.branch,
    environment: firstCommand.environment,
    triggeredBy: firstCommand.triggeredBy,
  };
  // batch deploy operation
  await sendAllDeploysNotification(input, "Bamboo release job finished");
};

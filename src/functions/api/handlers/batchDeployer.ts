import { DeployLatestBuildAction } from "../../models/deployLatestBuildAction";
import { CommandParser } from "../../services/commandParser";
import {
  DeployResult,
  executeDeployLatestCommand,
} from "../../services/executors/deployLatestBuildExecutor";
import {
  Deploy,
  getDeploy,
} from "../../services/executors/listDeploysExecutor";
import { SingleDeployCommand } from "../../services/stepFunctionService";
import {
  BatchDeployNotificationInput,
  getJobPageUrl,
  JobNotFinished,
  sendDeployAllNotification,
  sendDeployBuildNotification,
} from "./statusChecker";

export const deploySingle = async (event: any, context: any): Promise<any> => {
  console.log(`deploySingle: ${JSON.stringify(event)}`);
  try {
    const deployAction = (await CommandParser.build().parse(
      event.command,
      event.triggeredBy
    )) as DeployLatestBuildAction;
    return await executeDeployLatestCommand(deployAction, true);
  } catch (err: any) {
    console.log(JSON.stringify(err));
    throw err.message;
  }
};

export const checkSingle = async (event: any, context: any): Promise<any> => {
  console.log(`check: ${JSON.stringify(event)}`);
  const result: DeployResult = event.triggerResult;
  const deploy = await getDeploy(result.deployment.id);
  if ("FINISHED" !== deploy.lifeCycleState.toUpperCase()) {
    throw new JobNotFinished();
  }
  return deploy;
};

export const notifySingle = async (event: any, context: any): Promise<any> => {
  console.log(`notifySingle: ${JSON.stringify(event)}`);
  const singleDeployCommand = event as SingleDeployCommand;
  // failure notification
  if (event.error?.Cause) {
    let errorMessage = undefined;
    try {
      errorMessage = JSON.parse(event.error?.Cause)?.errorMessage;
    } catch (err: any) {
      console.log(`failed to parse error cause: ${event.error?.Cause}`);
    }
    await sendDeployBuildNotification(
      singleDeployCommand.service,
      singleDeployCommand.environment,
      "FAILED",
      singleDeployCommand.triggeredBy,
      undefined,
      errorMessage
    );
    return;
  }

  // execution result notification
  const result: DeployResult = event.triggerResult;
  const deploy: Deploy = event.deploy;
  await sendDeployBuildNotification(
    singleDeployCommand.service,
    singleDeployCommand.environment,
    deploy.deploymentState,
    getJobPageUrl(result.deployment.id, false),
    singleDeployCommand.triggeredBy
  );
};

export const notifyAll = async (event: any, context: any): Promise<any> => {
  console.log(`notifyAll: ${JSON.stringify(event)}`);
  const input: BatchDeployNotificationInput = {
    deploys: event.map((d: any) => ({
      service: d.service,
      status: d.error ? "FAILED" : d.deploy.deploymentState,
    })),
    environment: event[0].environment,
    triggeredBy: event[0].triggeredBy,
  };
  await sendDeployAllNotification(input);
};

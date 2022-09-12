import { BatcherExecutionInput, startExecution } from "../stepFunctionService";
import { ActionName } from "../../models/actions";
import { BatchBuildAction } from "../../models/batchBuildAction";
import { listPlans } from "./listPlansExecutor";

export const executeBatchBuildCommand = async (
  action: BatchBuildAction
): Promise<any> => {
  const plans = await listPlans();

  // validate incoming build plans
  const unknownServices: string[] = [];
  action.services.forEach((service) => {
    const plan = plans.find(
      (p: any) => p.name.toUpperCase() === service.toUpperCase()
    );
    if (!plan) {
      unknownServices.push(service);
    }
  });
  if (unknownServices.length > 0) {
    throw {
      status: 400,
      message: `Unknown plan(s) provided ${unknownServices}, please use "search-plans" command to search the plan first`,
    };
  }

  // start batcher step function for batch build
  const input: BatcherExecutionInput = {
    actionName: action.actionName,
    commands: action.services.map((service) => ({
      command: `${ActionName.BUILD} -s ${service} -b ${action.branch}`,
      service: service,
      branch: action.branch,
      triggeredBy: {
        id: action.triggeredBy.id,
        name: action.triggeredBy.name,
      },
    })),
  };
  await startExecution(input);
};

import {
  BatcherExecutionInput,
  startBatcherExecution,
} from "../stepFunctionService";
import { ActionName } from "../../models/actions";
import { BatchBuildAction } from "../../models/batchBuildAction";
import { listPlans } from "./listPlansExecutor";

export const executeBatchBuildCommand = async (
  action: BatchBuildAction
): Promise<any> => {
  const plans = await listPlans();

  // validate incoming build plans
  action.services.forEach((service) => {
    const plan = plans.find(
      (p: any) => p.name.toUpperCase() === service.toUpperCase()
    );
    if (!plan) {
      throw {
        status: 400,
        message: `Unknown plan provided ${service}, please use "search-plans" command to search the plan first`,
      };
    }
  });

  // start batcher step function for batch build
  const input: BatcherExecutionInput = {
    commands: action.services.map((service) => ({
      command: `${ActionName.BUILD} -s ${service} -b ${action.branch}`,
      service: service,
      branch: action.branch,
      triggeredBy: action.triggeredBy,
    })),
  };
  await startBatcherExecution(input);
};

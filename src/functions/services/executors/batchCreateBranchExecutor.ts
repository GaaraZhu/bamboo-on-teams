import { BatcherExecutionInput, startExecution } from "../stepFunctionService";
import { ActionName } from "../../models/actions";
import { listPlans } from "./listPlansExecutor";
import { BatchCreateBranchAction } from "../../models/batchCreateBranchAction";

export const executeBatchCreateBranchCommand = async (
  action: BatchCreateBranchAction
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
      command: `${ActionName.CREATE_BRANCH} -s ${service} -b ${action.vcsBranch}`,
      service: service,
      vcsBranch: action.vcsBranch,
      triggeredBy: {
        id: action.triggeredBy.id,
        name: action.triggeredBy.name,
      },
    })),
  };
  await startExecution(input);
};

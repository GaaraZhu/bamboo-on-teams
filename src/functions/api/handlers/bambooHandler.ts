import { Request, Response } from "lambda-api";
import { CommandParser } from "../../services/commandParser";

export const handle = async (
  request: Request,
  response: Response
): Promise<void> => {
  const { body }: any = request;
  try {
    const action = await CommandParser.build().parse(body.command);
    await action.process(response);
  } catch (err: any) {
    response.status(404).json({
      message: err.message,
    });
  }
};

import { Request, Response } from "lambda-api";
import { CommandParser } from "../../services/commandParser";

export const handle = async (
  request: Request,
  response: Response
): Promise<void> => {
  const { body }: any = request;
  try {
    const action = await CommandParser.build().parse(body.command);
    response.status(200).json({
      message: `command received: ${JSON.stringify(action)}`,
    });
  } catch (err: any) {
    response.status(404).json({
      message: err.message,
    });
  }
};

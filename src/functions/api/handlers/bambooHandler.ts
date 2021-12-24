import { Request, Response } from "lambda-api";

export const handle = async (
  request: Request,
  response: Response
): Promise<void> => {
    const { body }: any = request;
    response
        .status(200)
        .json({
            message: `command received: ${body.command} `
        });
};

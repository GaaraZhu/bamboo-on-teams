import { Request, Response } from "lambda-api";
import { CommandParser } from "../../services/commandParser";

export const handle = async (
  request: Request,
  response: Response
): Promise<void> => {
  const body: IncomingMessage = request.body;
  console.log(
    `Action: ${body.text} triggered by user ${body.from.name} from channel ${body.channelId}`
  );
  try {
    const action = await CommandParser.build().parse(body.text, body.from.name);
    await action.process(response);
  } catch (err: any) {
    console.log(
      `Failed to execute ACTION ${body.text} due to ${JSON.stringify(err)}`
    );
    response.status(err.status || 500).json(err.message);
  }
  console.log(`Action: ${body.text} finished`);
};

interface IncomingMessage {
  channelId: string;
  from: {
    id: string;
    name: string;
  };
  text: string;
}

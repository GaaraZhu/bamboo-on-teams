import { Request, Response } from "lambda-api";
import { handleCommand } from "./handlers/bambooHandler";

//----------------------------------------------------------------------------//
// Define authentication middleware
//----------------------------------------------------------------------------//
const crypto = require("crypto");
export const verifyHMAC = (
  request: Request,
  response: Response,
  next: () => void
): void => {
  const auth = request.headers["authorization"];
  // Calculate HMAC on the message we've received using the shared secret
  const msgBuf = Buffer.from(request.body, "utf8");
  const teamsSharedToken = process.env.TEAMS_HMAC_SHARED_TOKEN;
  const msgHash =
    "HMAC " +
    crypto
      .createHmac("sha256", teamsSharedToken)
      .update(msgBuf)
      .digest("base64");
  if (msgHash === auth) {
    return next();
  } else {
    return response.error(
      403,
      "Error: message sender cannot be authenticated."
    );
  }
};

//----------------------------------------------------------------------------//
// Build API routes
//----------------------------------------------------------------------------//
const app = require("lambda-api")({
  version: "v1.0",
  base: process.env.BATH_PATH,
});
app.post(
  "/command",
  //   verifyHMAC,
  async (request: Request, response: Response) => {
    await handleCommand(request, response);
  }
);

//----------------------------------------------------------------------------//
// Main router handler
//----------------------------------------------------------------------------//
module.exports.router = (event: any, context: any, callback: any) => {
  // Run the request
  app.run(event, context, callback);
};

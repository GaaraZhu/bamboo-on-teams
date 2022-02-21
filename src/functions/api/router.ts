import { Request, Response } from "lambda-api";
import { getConfig } from "../services/config";
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
  try {
    const expectedReqHash = request.headers["authorization"];
    // Calculate HMAC on the message we've received using the shared secret
    const teamsSharedToken = getConfig().hmacToken;
    const bufSecret = Buffer.from(teamsSharedToken, "base64");
    const msgBuf = Buffer.from(request.rawBody, "utf8");
    const actualReqHash =
      "HMAC " +
      crypto.createHmac("sha256", bufSecret).update(msgBuf).digest("base64");
    if (actualReqHash === expectedReqHash) {
      return next();
    } else {
      return response.error(
        403,
        "Error: message sender cannot be authenticated."
      );
    }
  } catch (e) {
    console.log(JSON.stringify(e));
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
  verifyHMAC,
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

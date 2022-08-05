export interface Config {
  bambooHostUrl: string;
  bambooAPIToken: string;
  hmacToken: string;
  notificationURL: string;
  prod?: {
    enabled: boolean;
    bambooAPIToken: string;
    allowedUserIds: string[];
  };
}

let config: Config;
export const getConfig = (): Config => {
  if (!config) {
    if (!process.env.APPLICATION_CONFIG) {
      throw {
        status: 500,
        message: "Missing application configuration",
      };
    }
    console.log("Parsing application config");
    config = JSON.parse(process.env.APPLICATION_CONFIG);
  }

  return config;
};

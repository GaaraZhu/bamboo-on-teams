import { InvalidArgumentError } from "commander";

export type Class<T> = {
  new (command: string): T;
};

export const trim = (value: string | undefined): any => {
  if (!value || /^ *$/.test(value)) {
    throw new InvalidArgumentError("empty argument");
  }

  return value.trim();
};

export const prodEnvCheck = (env: string): void => {
  if (
    process.env.ENABLE_FOR_PROD?.toUpperCase() === "TRUE" &&
    env?.toUpperCase().startsWith("PROD")
  ) {
    throw {
      status: 400,
      message: "Bamboo-on-teams is disabled for production environment",
    };
  }
};

export const statusCheck = (status: number, message: string): void => {
  if (status >= 300) {
    throw {
      status: status,
      message: message,
    };
  }
};

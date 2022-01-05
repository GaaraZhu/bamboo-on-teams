import { InvalidArgumentError } from "commander";

export const emptyCheck = (value: string | undefined): any => {
  if (!value || /^ *$/.test(value)) {
    throw new InvalidArgumentError("empty argument");
  }

  return value;
};

export const prodEnvCheck = (env: string): void => {
  if (
    process.env.ENABLE_FOR_PROD?.toUpperCase() === "TRUE" &&
    env?.toUpperCase().startsWith("PROD")
  ) {
    throw Error("Bamboo-on-teams is disabled for production environment");
  }
};

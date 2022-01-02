export const isEmpty = (value: string | undefined): boolean => {
  return !value || /^ *$/.test(value);
};

export const prodEnvCheck = (env: string): void => {
  if (
    process.env.ENABLE_FOR_PROD?.toUpperCase() === "TRUE" &&
    env?.toUpperCase().startsWith("PROD")
  ) {
    throw Error("Bamboo-on-teams is disabled for production environment");
  }
};

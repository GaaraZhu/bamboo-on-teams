module.exports = {
    verbose: true,
    preset: "ts-jest",
    testEnvironment: "node",
    collectCoverage: true,
    coverageDirectory: "coverage",
    collectCoverageFrom: ["src/**/**/*.ts", "!src/functions/api/router.ts"],
    coverageThreshold: { global: { branches: 80, functions: 80, lines: 80, statements: 80 } },
};
process.env.IS_OFFLINE = true;

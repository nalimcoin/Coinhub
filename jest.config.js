const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  preset: "ts-jest",
  testMatch: ["**/tests/**/*.test.ts"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  roots: ["<rootDir>/tests", "<rootDir>/backend"],
  transform: {
    ...tsJestTransformCfg,
  },
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.test.json",
    },
  },
};
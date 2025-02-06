export default {
    testEnvironment: "node",
    transform: {
      "^.+\\.js$": "babel-jest",
    },
    moduleNameMapper: {
      "^\\.{1,2}/(.*)\\.js$": "<rootDir>/$1.js",
    },
    transformIgnorePatterns: ["/node_modules/(?!chai)"],
    setupFiles: ["dotenv/config"],
    extensionsToTreatAsEsm: [".js"],
  };
  
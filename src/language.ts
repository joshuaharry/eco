import type { Dependencies } from "./dependencies";

export interface DockerConfig {
  // the name of the Dockerfile used to create the image
  dockerFile: string;
  // the name of the docker image to create
  imageName: string;
}

export interface StrategyConfig {
  // What version are we on of the tool?
  ecoVersion: string;
  // What is the name of this strategy?
  name: string;
  // Who wrote the strategy?
  author: string;
  // What is the license associated with this strategy?
  license: string;
  // What is the timeout of the strategy?
  timeout: number;
  // What are the system dependencies of the strategy?
  dependencies: Dependencies;
  // an optional Docker configuration
  docker?: DockerConfig;
}

export type EcoFind = {
  name: string;
  uses: "@eco/find";
  ecosystem: string;
  timeout?: number;
};

// A step in the strategy. Usually, these correspond to shell commands, but
// we have some built-in directives for handling special cases like cloning
// a repository from GitHub.
export type StrategyStep =
  | {
      name: string;
      run: string;
      timeout?: number;
    }
  | EcoFind;

export interface StrategyAction {
  steps: Array<StrategyStep>;
  cleanup: Array<StrategyStep>;
}

export interface Strategy {
  config: StrategyConfig;
  action: StrategyAction;
}

export interface ExecuteRequest {
  defaultTimeout: number;
  lib: string;
  cwd: string;
  logFile: string;
  steps: Array<StrategyStep>;
  cleanup: Array<StrategyStep>;
}

export type OperationTimeout = "OPERATION_TIMEOUT";

export type StepResult = "STEP_SUCCESS" | "STEP_FAILURE" | OperationTimeout;

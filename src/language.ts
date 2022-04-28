import type { Dependencies } from "./dependencies";

interface StrategyConfig {
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
}

// A step in the strategy. Usually, these correspond to shell commands, but
// we have some built-in directives for handling special cases like cloning
// a repository from GitHub.
//
// NOTE: If you need to add a new directive, add another variant to this
// type.
type StrategyStep =
  | {
      name: string;
      run: string;
      timeout?: number;
    }
  | {
      name: string;
      uses: "@eco/find";
      ecosystem: string;
      timeout?: number;
    };

interface StrategyAction {
  steps: Array<StrategyStep>;
  cleanup: Array<StrategyStep>;
}

export interface Strategy {
  config: StrategyConfig;
  action: StrategyAction;
}

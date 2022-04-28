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

// A step in the strategy which usually corresponds to some shell command.
interface StrategyStep {
  name: string;
}

interface StrategyAction {
  steps: Array<StrategyStep>;
  cleanup: Array<StrategyStep>;
}

export interface Strategy {
  config: StrategyConfig;
  action: StrategyAction;
}

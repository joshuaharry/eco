export interface StrategyRequest {
  // Where is the JSON file with the strategy located?
  strategyPath: string;
  // Where is the list of packages to analyze located?
  filesPath: string;
}

interface SystemDependency {
  program: string;
  command: string;
  mustHave: string;
}

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
  dependencies: {
    required: Array<SystemDependency>;
  };
}

export const interpret = (req: StrategyRequest) => {
  return req;
};

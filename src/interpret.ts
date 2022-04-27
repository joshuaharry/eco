export interface StrategyRequest {
  strategyPath: string;
  filesPath: string;
}

export const interpret = (req: StrategyRequest) => {
  return req;
};

import type { Action } from "./Action";
import type { Config } from "./Config";

export interface Strategy { config: Config, action: Action, }
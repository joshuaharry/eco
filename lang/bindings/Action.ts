import type { Step } from "./Step";

export interface Action { steps: Array<Step>, cleanup: Array<Step>, }
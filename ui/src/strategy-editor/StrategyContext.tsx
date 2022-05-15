import React from "react";
import { Strategy } from "../lang-types/Strategy";
import produce from "immer";
import scotty from "./scotty";

export type STEP_LOCATION = "ACTIONS" | "CLEANUP";

type StrategyEvent = {
  type: "MOVE_STEP";
  payload: {
    stepLocation: STEP_LOCATION;
    hoverIdx: number;
    dragIdx: number;
  };
};

const reduceProd = (prev: Strategy, action: StrategyEvent): Strategy => {
  switch (action.type) {
    case "MOVE_STEP": {
      const {
        payload: { dragIdx, hoverIdx, stepLocation },
      } = action;
      const idx = stepLocation === "ACTIONS" ? "steps" : "cleanup";
      return produce(prev, (draft) => {
        draft.action[idx] = draft.action[idx].map((el, i) => {
          if (i === dragIdx) {
            return { ...draft.action[idx][hoverIdx] };
          }
          if (i === hoverIdx) {
            return { ...draft.action[idx][dragIdx] };
          }
          return el;
        });
      });
    }
  }
};

const reduceDev = (prev: Strategy, action: StrategyEvent): Strategy => {
  console.groupCollapsed(action.type);
  console.log("%c PREVIOUS", "color: blue; font-weight: bold;", prev);
  console.log("%c ACTION", "color: red; font-weight: bold;", action);
  const res = reduceProd(prev, action);
  console.log("%c NEXT", "color: green; font-weight: bold", res);
  console.groupEnd();
  return res;
};

export const reduce =
  process.env.NODE_ENV === "development" ? reduceDev : reduceProd;

const StrategyContext = React.createContext<null | Strategy>(null);

const StrategyDispatchContext =
  React.createContext<null | React.Dispatch<StrategyEvent>>(null);

export const useStrategy = () => {
  const strategy = React.useContext(StrategyContext);
  if (strategy === null) {
    throw new Error("Please use useStrategy inside of its provider.");
  }
  return strategy;
};

export const useDispatch = () => {
  const dispatch = React.useContext(StrategyDispatchContext);
  if (dispatch === null) {
    throw new Error("Please use useDispatch inside of its provider.");
  }
  return dispatch;
};

const StrategyProvider: React.FC<{ children: React.ReactNode }> = (props) => {
  const { children } = props;
  const [state, dispatch] = React.useReducer(reduce, scotty);
  return (
    <StrategyContext.Provider value={state}>
      <StrategyDispatchContext.Provider value={dispatch}>
        {children}
      </StrategyDispatchContext.Provider>
    </StrategyContext.Provider>
  );
};

export default StrategyProvider;

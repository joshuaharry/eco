import StrategyContext, { reduce } from "./StrategyContext";
import init from "./scotty";

import { render } from "../testUtils";

describe("Our reducer", () => {
  test("Lets us flip two items in the steps", () => {
    const res = reduce(init, {
      type: "MOVE_STEP",
      payload: {
        stepLocation: "ACTIONS",
        dragIdx: 0,
        hoverIdx: 1,
      },
    });
    expect(res.action.steps[0]).toEqual({
      uses: "Run",
      name: "Install the Dependencies",
      run: "npm install --legacy-peerdeps",
      timeout: null,
    });
    expect(res.action.steps[1]).toEqual({
      name: "Download the Source Code",
      uses: "Find",
      ecosystem: "npm",
      timeout: null,
    });
  });
  test("Lets us flip two items in the cleanup", () => {
    const first = init.action.cleanup[0];
    const second = {
      uses: "Run" as const,
      name: "test",
      timeout: 3000,
      run: "echo hi",
    };
    const res = reduce(
      {
        ...init,
        action: {
          ...init.action,
          cleanup: [first, second],
        },
      },
      {
        type: "MOVE_STEP",
        payload: {
          stepLocation: "CLEANUP",
          dragIdx: 0,
          hoverIdx: 1,
        },
      }
    );
    expect(res.action.cleanup[0]).toEqual(second);
  });
});

describe("Our StrategyContext component", () => {
  test("Does not crash on rendering", () => {
    render(<StrategyContext>Hello!</StrategyContext>);
  });
});

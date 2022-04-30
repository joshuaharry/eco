// To play with this code, you can install `tsnd` globally and try running
// it!

import { runInPool } from "./concurrency";
import { setTimeout } from "timers/promises";

const nums = [0, 1, 2, 3, 4, 5, 6, 7, 8];

const tasks = nums.map((num) => {
  const fn = async () => {
    console.log(`Beginning task ${num}...`);
    await setTimeout(1000);
    console.log(`Task ${num} complete.`);
  };
  return fn;
});

runInPool(4, tasks);

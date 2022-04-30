/**
 * Inspired by code from https://github.com/rxaviers/async-pool/blob/master/lib/es9.js
 *
 * Here we execute all of the unstarted tasks in a pool, running only a parameterized
 * number of them at a time. The trick to making this work is to represent the pool as
 * a hash set of running promises that know how to delete themselves from the set after
 * they finish.
 *
 * When the pool gets too big, we get the values in the pool as an array and use
 * Promise.race to wait for one to finish. At the very very end, when we've started
 * every task we'd like to, we wait for everything left in the pool to finish before
 * yielding control back to the caller.
 */

export const runInPool = async <T = unknown>(
  parallelism: number,
  unstartedTasks: Array<() => Promise<T>>
) => {
  const taskPool = new Set<Promise<unknown>>();
  for (const unstartedTask of unstartedTasks) {
    const task = unstartedTask();
    task.then(() => taskPool.delete(task)).catch(() => taskPool.delete(task));
    taskPool.add(task);
    if (taskPool.size >= parallelism) {
      await Promise.race(Array.from(taskPool.values()));
    }
  }
  await Promise.all(Array.from(taskPool.values()));
};

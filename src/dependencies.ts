import { run, programExists } from "./util";

interface SystemDependency {
  // What program do we need to try to execute?
  program: string;
  // Is there additional output we need to check?
  checkOutput?: {
    // If there is, what argument should we pass to it?
    argument: string;
    // What do we need to check the output includes?
    includes: string;
  };
}

// What are the dependencies of a particular strategy?
export interface Dependencies {
  // Which dependencies are absolutely required?
  required: Array<SystemDependency>;
}

const validateDependency = async (dep: SystemDependency): Promise<void> => {
  const exists = await programExists(dep.program);
  if (!exists) {
    console.error(
      `Fatal error: required dependency ${dep.program} is not installed on $PATH.`
    );
    process.exit(1);
  }
  if (!dep.checkOutput) return;
  const { includes, argument } = dep.checkOutput;
  const command = `${dep.program} ${argument}`;
  try {
    const { stdout, stderr } = await run(command);
    if (!stdout.match(new RegExp(includes))) {
      console.error(`Fatal error: We expected the output of ${command} to include ${includes}

STDERR:
  ${stderr}

STDOUT:
  ${stdout}`);
      process.exit(1);
    }
  } catch (err) {
    console.error(`Fatal error when trying to run ${command}

                  ${err}`);
    process.exit(1);
  }
};

export const validate = async (deps: Dependencies, name: string): Promise<void> => {
  console.log(`Checking dependencies "${name}"...`);
  await Promise.all(deps.required.map((dep) => validateDependency(dep)));
  console.log(`Dependencies validated, proceeding to execute strategy "${name}".`);
};

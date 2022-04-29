#!/usr/bin/env node
import { parseArgv } from "./argParse";
import { interpret } from "./interpret";

if (require.main === module) {
  const req = parseArgv(process.argv);
  interpret(req);
}

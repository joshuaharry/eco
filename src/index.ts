#!/usr/bin/env node
import { parseArgv } from "./argParse";
import { interpret } from "./interpret";

// TODO: Periodically, node is throwing errors related to closing streams.
// I'm not sure why this is happening, so in the meantime, we'll log the
// exceptions and try to keep going.
process.on("uncaughtException", function (err) {
  console.error(err);
  console.error(err.stack);
});

if (require.main === module) {
  const req = parseArgv(process.argv);
  interpret(req);
}

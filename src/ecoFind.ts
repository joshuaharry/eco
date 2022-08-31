/*=====================================================================*/
/*    serrano/prgm/project/jscontract/eco/src/ecoFind.ts               */
/*    -------------------------------------------------------------    */
/*    Author      :  Joshua Hoeflich                                   */
/*    Creation    :  Tue Jul 26 09:15:08 2022                          */
/*    Last change :  Tue Aug 30 22:57:39 2022 (serrano)                */
/*    Copyright   :  2022 Hoeflich, Findler, Serrano                   */
/*    -------------------------------------------------------------    */
/*    find and clone a package git repository.                         */
/*=====================================================================*/

/*---------------------------------------------------------------------*/
/*    The module                                                       */
/*---------------------------------------------------------------------*/
import type { EcoFind, ExecuteRequest, StepResult } from "./language";
import { appendFile, runCommand } from "./util";
import axios from "axios";
import type { Shell } from "./shell";

export { gitUrl, ecoFind };

/*---------------------------------------------------------------------*/
/*    ecosystemFetchers ...                                            */
/*---------------------------------------------------------------------*/
const ecosystemFetchers: Record<
  string,
  (req: ExecuteRequest, find: EcoFind, shell: Shell) => Promise<string>
> = {
  async git(req) {
    return req.lib;
  },
  async npm(req, find, shell) {
    const search = `http://registry.npmjs.com/-/v1/search?text=${req.lib}&size=1`;
    const { data } = await axios.get(search, {
      timeout: find.timeout || req.defaultTimeout,
    });
    let { repository } = data.objects[0].package.links;
    if (typeof repository !== "string") {
      // try using npm view
      const cmd = {
         timeout: find.timeout || req.defaultTimeout,
	 command: `npm view ${req.lib} repository.url`,
	 cwd: shell.cwd(),
	 outputFile: "-",
	 output: "",
	 lib: req.lib
      };
      if (await runCommand(cmd, shell) === "STEP_SUCCESS") {
         repository = cmd.output
                         .trim()
                         .replace(/(remote-)?git[+]https/, "https")
                         .replace(/git[+]ssh:[/][/]git@github[.]com/, "https://github.com")
                         .replace(/git:[/][/]github.com/, "https://github.com")

	 if (repository === "") {
	    repository = null;
	 }
      }
    }
      
    if (typeof repository !== "string") {
      await appendFile(
        req.logFile,
        `*** ECO-FATAL-ERROR:no-git: Cannot find the git repository of ${req.lib} in the npm registry.`
      );
      return "STEP_FAILURE";
    }
    return repository;
  },
};


/*---------------------------------------------------------------------*/
/*    gitUrl ...                                                       */
/*---------------------------------------------------------------------*/
async function gitUrl(req: ExecuteRequest, find: EcoFind, shell: Shell): Promise<StepResult | string> {
  const fetcher = ecosystemFetchers[find.ecosystem];
  if (!fetcher) {
    await appendFile(
      req.logFile,
      `*** ECO-FATAL-ERROR:no-pkg: Cannot find packages in the ${find.ecosystem} yet.`
    );
    return "STEP_FAILURE";
  }
  try {
    const libPath = fetcher(req, find, shell);
    return libPath;
  } catch (err) {
    await appendFile(
      req.logFile,
      `*** ECO-FATAL-ERROR:no-lib: Could not find ${req.lib} in the ${find.ecosystem} ecosystem`
    );
    return "STEP_FAILURE";
  }
};

/*---------------------------------------------------------------------*/
/*    ecoFind ...                                                      */
/*---------------------------------------------------------------------*/
async function ecoFind(req: ExecuteRequest, find: EcoFind, shell: Shell): Promise<StepResult> {
  const url = await gitUrl(req, find, shell);
  if (url === "STEP_FAILURE") {
    return url;
  }
  await appendFile(
    req.logFile,
    `git clone ${url} ${req.cwd}\n`
  );

  const res = await runCommand({
    timeout: find.timeout || req.defaultTimeout,
    command: `git clone ${url} ${req.cwd}`,
    cwd: shell.cwd(),
    outputFile: req.logFile
  }, shell);
  return res;
};

export default ecoFind;

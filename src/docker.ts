/*=====================================================================*/
/*    serrano/prgm/project/jscontract/eco/src/docker.ts                */
/*    -------------------------------------------------------------    */
/*    Author      :  manuel serrano                                    */
/*    Creation    :  Tue Aug 30 21:56:16 2022                          */
/*    Last change :  Tue Aug 30 22:36:20 2022 (serrano)                */
/*    Copyright   :  2022 manuel serrano                               */
/*    -------------------------------------------------------------    */
/*    Docker utility functions                                         */
/*=====================================================================*/

/*---------------------------------------------------------------------*/
/*    Module                                                           */
/*---------------------------------------------------------------------*/
import { log, system, run } from "./util";
import os from "os";
import type { DockerConfig } from "./language";

/*---------------------------------------------------------------------*/
/*    dockerInit ...                                                   */
/*---------------------------------------------------------------------*/
export async function dockerInit(docker: DockerConfig | undefined) {
  if (docker) {
    // check if the docker image already exists
    const checkcmd = `docker image inspect --format="-" ${docker.imageName}`;
    log(`checking the docker image [${checkcmd}]`);
    const { stdout } = await system(checkcmd, false);

    if (stdout !== "-") {
      // there is not docker image, create one...
      const buildcmd = `docker build -f ${docker.dockerFile} -t ${docker.imageName} .`;
    
      log(`creating the docker image [${buildcmd}]`);
    
      const { code } = await system(buildcmd, true);
      if (code !== 0) {
         console.error("Cannot create the docker image...");
         process.exit(1);
      }
    }
  }
}
 
/*---------------------------------------------------------------------*/
/*    dockerWrapCommand ...                                            */
/*    -------------------------------------------------------------    */
/*    If docker is to be used, wrap the command accordingly.           */
/*---------------------------------------------------------------------*/
export function dockerWrapCommand(lib: string | undefined, command: string, docker: DockerConfig | undefined) {
  if (!docker) {
    return command;
  } else {
    return `docker exec ${docker.imageName}.${lib} ${command}`;
  }
}

/*---------------------------------------------------------------------*/
/*    dockerCreateContainer ...                                        */
/*---------------------------------------------------------------------*/
export async function dockerCreateContainer(lib: string, docker: DockerConfig) {
   const img = docker.imageName;
   const cmd = `docker run --name ${img}.${lib} ${img} -c "tail -f /dev/null"`;
   
   log(`creating docker container [${cmd}]`);
   run(cmd);
   return new Promise((res, rej) => setTimeout(() => res(true), 1000));
}

/*---------------------------------------------------------------------*/
/*    dockerCleanupContainer ...                                       */
/*---------------------------------------------------------------------*/
export async function dockerCleanupContainer(lib: string, docker: DockerConfig) {
}

/*---------------------------------------------------------------------*/
/*    dockerRm ...                                                     */
/*---------------------------------------------------------------------*/
export async function dockerRm(lib: string, cwd: string, opt: { force: boolean; recursive: boolean }, docker: DockerConfig ) {
   const dir = dockerExpandHome(cwd, docker);
   const cmd = `rm ${opt.recursive ? "-r" : ""} ${opt.force ? "-f" : ""} ${dir}`
   const wcmd = dockerWrapCommand(lib, cmd, docker);
   
   log(`dockerRm [${cmd}]`);
   await run(wcmd);
}

/*---------------------------------------------------------------------*/
/*    dockerMkdirp ...                                                 */
/*---------------------------------------------------------------------*/
export async function dockerMkdirp(lib: string, cwd: string, docker: DockerConfig ) {
   const dir = dockerExpandHome(cwd, docker);
   const cmd = `mkdir -p ${dir}`
   const wcmd = dockerWrapCommand(lib, cmd, docker);
   
   log(`dockerMkdirp [${wcmd}]`);
   await run(wcmd);
}

/*---------------------------------------------------------------------*/
/*    dockerExpandHome ...                                             */
/*---------------------------------------------------------------------*/
export function dockerExpandHome(dir: string, docker: DockerConfig | undefined) {
  if (docker) {
    return dir.replace(/~/, "/home/scotty");
  } else {
    return dir.replace(/~/, os.homedir());
  }
}

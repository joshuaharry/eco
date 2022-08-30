/*=====================================================================*/
/*    serrano/prgm/project/jscontract/eco/src/docker.ts                */
/*    -------------------------------------------------------------    */
/*    Author      :  manuel serrano                                    */
/*    Creation    :  Tue Aug 30 21:56:16 2022                          */
/*    Last change :  Tue Aug 30 22:34:16 2022 (serrano)                */
/*    Copyright   :  2022 manuel serrano                               */
/*    -------------------------------------------------------------    */
/*    Docker utility functions                                         */
/*=====================================================================*/

/*---------------------------------------------------------------------*/
/*    Module                                                           */
/*---------------------------------------------------------------------*/
import { log, system } from "./util";
import type { DockerConfig } from "./language";

/*---------------------------------------------------------------------*/
/*    dockerInit ...                                                   */
/*---------------------------------------------------------------------*/
export async function dockerInit(docker: DockerConfig | undefined) {
  if (docker) {
    // check if the docker image already exists
    // create the docker image when not already existing
    const cmd = `docker build -f ${docker.dockerFile} -t ${docker.imageName} .`;
    
    log(`creating the docker image [${cmd}]`);
    
    const { code } = await system(cmd, true);
    if (code !== 0) {
       console.error("Cannot create the docker image...");
       process.exit(1);
    }
  }
}
 
/*---------------------------------------------------------------------*/
/*    dockerWrapCommand ...                                            */
/*    -------------------------------------------------------------    */
/*    If docker is to be used, wrap the command accordingly.           */
/*---------------------------------------------------------------------*/
export function dockerWrapCommand(command: string, docker: DockerConfig | undefined) {
  if (!docker) {
    return command;
  } else {
    return `docker exec ${docker.imageName} ${command}`;
  }
}


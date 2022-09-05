/*=====================================================================*/
/*    serrano/prgm/project/jscontract/eco/src/shell.ts                 */
/*    -------------------------------------------------------------    */
/*    Author      :  manuel serrano                                    */
/*    Creation    :  Tue Aug 30 23:23:23 2022                          */
/*    Last change :  Mon Sep  5 17:39:58 2022 (serrano)                */
/*    Copyright   :  2022 manuel serrano                               */
/*    -------------------------------------------------------------    */
/*    Shell environments                                               */
/*=====================================================================*/

/*---------------------------------------------------------------------*/
/*    The module                                                       */
/*---------------------------------------------------------------------*/
import os from "os";
import fs from "fs";
import path from "path";
import { log, system, run } from "./util";
import { spawn, execSync } from "child_process";
import type { ChildProcessWithoutNullStreams } from "child_process";
import { mkdirp, rm } from "fs-extra";

/*---------------------------------------------------------------------*/
/*    Shell ...                                                        */
/*---------------------------------------------------------------------*/
export abstract class Shell {
  public home: string = "";
  public tmp: string = "";
  
  constructor(home: string) {
    this.home = home;
  }
  abstract init(): any;
  abstract cleanup(): any;
  abstract log(msg: string): void;
  abstract fork(lib: string): Promise<Shell>;
  abstract rm(dir: string, opt: { force: boolean, recursive: boolean }): void;
  abstract mkdirp(dir: string): void;
  abstract spawn(cmd: string, opt: { shell: boolean, cwd: string }): ChildProcessWithoutNullStreams;
  abstract chdir(dir: string): void;
  abstract cwd(): string;
}

/*---------------------------------------------------------------------*/
/*    HostShell ...                                                    */
/*---------------------------------------------------------------------*/
export class HostShell extends Shell {
  constructor() { 
    super(os.homedir());
  }
  
  init() {
  }
  
  cleanup() {
    if (fs.existsSync(this.tmp)) {
      fs.rmdirSync(this.tmp, { recursive: true });
    }
  }

  log(msg: string): void {
    log(`[HostShell] ${msg}`);
  }
    
  async fork(lib: string): Promise<Shell> {
    const sh = new HostShell();
    sh.tmp = "/tmp/" + lib;
    
    // create the tmp directory
    mkdirp(sh.tmp);
    
    return new Promise((res, rej) => res(sh));
  }

  async rm(dir: string, opt: { force: boolean, recursive: boolean }) {
    const d = dir.replace(/~/, this.home);
    
    this.log(`rm [${d}]`);
    return rm(d, opt);
  }
  
  async mkdirp(dir: string) {
    const d = dir.replace(/~/, this.home);
    
    this.log(`mkdirp [${d}]`);
    return mkdirp(d);
  }
  
  async chdir(dir: string) {
    const d = dir.replace(/~/, this.home);
    process.chdir(d);
  }
  
  cwd(): string {
    return process.cwd();
  }
  
  spawn(cmd: string, opt: { shell: boolean, cwd: string }): ChildProcessWithoutNullStreams {
    const acmd = cmd.replace(/~/, this.home);
    const fname = path.join(this.tmp, "cmd");
    
    try {
      const fd = fs.openSync(fname, "w");
        
      this.log(`generating ${fname}`);
      
      fs.writeSync(fd, "#!/bin/bash\n");
      fs.writeSync(fd, `cd ${opt?.cwd || this.cwd()}\n`);
      fs.writeSync(fd, `${acmd}\n`);
      fs.closeSync(fd);
  
      fs.chmodSync(fname, 0o777)
    } catch(e) {
      this.log(`***ECO:ERROR:could not create the cmd file "${fname}"`);
    }
    
    this.log(`spawn [${acmd}]`);
    return spawn(fname);
  }
}
 
/*---------------------------------------------------------------------*/
/*    DockerShell ...                                                  */
/*---------------------------------------------------------------------*/
export class DockerShell extends Shell {
  private $cwd: string = "";
  private $incremental: boolean;
  
  private dockerFile: string;
  private imageName: string;
  private $terminating: boolean = false;
  private lib: string | null = null;
  
  constructor(home: string, dockerFile: string, imageName: string, incremental: boolean) {
    super(home);
    this.dockerFile = dockerFile;
    this.imageName = imageName
    this.$cwd = this.home;
    this.$incremental = incremental;
  }

  log(msg: string): void {
    log(`[DockerShell] ${msg}`);
  
  }
  
  async fork(lib: string): Promise<Shell> {
    const sh = new DockerShell(this.home, this.dockerFile, this.imageName, this.$incremental);
    let aborted = false;
    let startedSuccessfully = false;
    
    this.log(`forking container "${this.imageName}.${lib}`);
    
    sh.lib = lib;
    sh.tmp = "/tmp/" + lib;
    
    // create the tmp directory
    mkdirp(sh.tmp);
    
    // create the docker container
    if (this.$incremental) {
      const cmd = `docker run --name ${sh.containerName()} ${sh.imageName} -c "tail -f /dev/null"`;
   
      // this command will eventually be abruptly stopped
      run(cmd).catch((e) => { 
        aborted = e;
        if (!sh.$terminating && startedSuccessfully) {
          console.error(`fork failed: ${e.toString()}`);
        }});

      const checkInterval = 1000; // msec
      const ttl = 10 * 1000; // msec
      async function loop(res: (n:Shell) => void, rej: (reason? : any) => void, n: number) {
        if (!aborted && n < ttl) {
          const { code, stdout, stderr } = await system(`docker exec ${sh.containerName()} echo "started"`,false);
            if (code === 0) {
              startedSuccessfully = true;
              res(sh);
            } else {
	      console.log(`fork(${n}) [docker exec ${sh.containerName()} echo "started"}] `, "{" + stdout + "}", "[" + stderr +"]" );
              setTimeout(() => loop(res, rej, n+checkInterval), checkInterval);
            }
        } else {
          rej(`Error in fork: could not start container ${lib}: ${aborted ? aborted.toString() : "timeout"}`);
        }
      }
      return new Promise<Shell>((res, rej) => loop(res, rej, 0));
    } else {
      return new Promise<Shell>((res, rej) => res(sh));
    }
  }

  containerName(): string {
    if (this.lib) {
      return `${this.imageName}.${this.lib}`;
    } else {
      throw "DockerShell not forked";
    }
  }
  
  wrap(cmd: string) {
    return `docker exec ${this.containerName()} ${cmd}`;
  }
  
  async init(): Promise<boolean> {
    // check if the docker image already exists
    const checkcmd = `docker image inspect --format="-" ${this.imageName}`;
    
    this.log(`checking the image [${checkcmd}]`);
    const { stdout } = await system(checkcmd, false);

    if (stdout !== "-") {
      // there is not docker image, create one...
      const buildcmd = `docker build -f ${this.dockerFile} -t ${this.imageName} .`;
    
      this.log(`creating the image [${buildcmd}]`);
    
      const { code } = await system(buildcmd, true);
      if (code !== 0) {
         console.error("Cannot create the docker image...");
         process.exit(1);
      }
    }
    
    return true;
  }
  
  async cleanup() {
    const cmd = `docker rm -f ${this.containerName()}`;
   
    this.log(`cleaning docker container [${cmd}]`);
    this.$terminating = true;
    await run(cmd);
  }
  
  async rm(dir: string, opt: { force: boolean, recursive: boolean }) {
    const d = dir.replace(/~/, this.home);
    const cmd = `rm ${opt.recursive ? "-r" : ""} ${opt.force ? "-f" : ""} ${d}`
    const wcmd = this.wrap(cmd);
   
    this.log(`rm [${wcmd}]`);
    await run(wcmd);
  }
  
  async mkdirp(dir: string) {
    const d = dir.replace(/~/, this.home);
    const cmd = `mkdir -p ${d}`
    const wcmd = this.wrap(cmd);
   
    this.log(`mkdirp [${wcmd}]`);
    await run(wcmd);
  }
  
  async chdir(dir: string) {
    const d = dir.replace(/~/, this.home);
    this.$cwd = d;
  }
  
  cwd() {
    return this.$cwd;
  }
  
  spawn(cmd: string, opt: { shell: boolean, cwd: string }): ChildProcessWithoutNullStreams {
    if (this.$incremental) {
      const acmd = cmd.replace(/~/, this.home);
      const fname = path.join(this.tmp, "cmd");
      const fd = fs.openSync(fname, "w");
      
      this.log(`spawn [${acmd}]`);
      
      fs.writeSync(fd, "#!/bin/bash\n");
      fs.writeSync(fd, `cd ${opt?.cwd || this.cwd()}\n`);
      fs.writeSync(fd, `${acmd}\n`);
      fs.closeSync(fd);
      
      execSync(`docker cp ${fname} ${this.containerName()}:/tmp/cmd`);
      execSync(`docker exec --user root ${this.containerName()} chown scotty:scotty /tmp/cmd`);
      execSync(`docker exec ${this.containerName()} chmod a+rx /tmp/cmd`);
      
      return spawn("docker", ["exec", this.containerName(), "/tmp/cmd"]);
    } else {
      console.log("ICI");
      return spawn("docker", ["run", "--name", this.containerName(), this.imageName, "-c", "/bin/bash", cmd]);;
    }
  }
}

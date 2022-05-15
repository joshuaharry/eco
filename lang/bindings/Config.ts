import type { Dependencies } from "./Dependencies";

export interface Config { name: string, author: string, license: string, timeout: number, dependencies: Dependencies, }
export const compFlags: string [] = [];
export var unrollString :string[] = ["--u 32"];
export const smcverFlags: string [] = [];
export var createFVEnvFlags: string [] = [];
export var cloneFlags: string [] = [];
export var fvEnvironmentLocation: string[] = [];
export var flagList: string[][] = [cloneFlags, createFVEnvFlags, fvEnvironmentLocation];

export var canBuild = 6;
export var canClone = 2;
export var canRunSmcver = 1;
export var canIDoStuff: number[] = [canClone, canBuild, canRunSmcver];


export  enum Action {
    clone = 0,
    build = 1,
    run = 2
  }
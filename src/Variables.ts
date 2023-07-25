/** 
  Variables.ts - All the global varibales we use for: saving our flags for our scripts & manage if we can perform an action.
*/

/** Array for compilation flags */
export const compFlags: string [] = [];

/** Array for smcver run flags */
export const smcverFlags: string [] = [];

/** Flag that represent the unroll when running smcver. By default the value is 32 */
export var unrollString :string[] = ["--u 32"];

/** 
  flagList - Array contains flags array for a specific action.
             cloneFlags - flags for clone. 
             createFVEnvFlags - flags for build fv environment.
             fvEnvironmentLocation - flag for compilation, run smcver and cex logic.
  When flag is written, the array is updated accordingly. The logic for that is at TreeView.ts.
*/
export var createFVEnvFlags: string [] = [];
export var cloneFlags: string [] = [];
export var fvEnvironmentLocation: string[] = [];
export var flagList: string[][] = [cloneFlags, createFVEnvFlags, fvEnvironmentLocation];

/** 
  canIDoStuff - Array contains the number of mandatory flags that require to do a specific action.
                canClone - for cloning. 
                canBuild - for build fv environment.
                canRunSmcver - for running smcver.
  When flag is written, the counter is decreasing. The logic for that is at TreeView.ts.
*/
export var canBuild = 6;
export var canClone = 2;
export var canRunSmcver = 1;
export var canIDoStuff: number[] = [canClone, canBuild, canRunSmcver];

/**
  Actions we can do that also represent the index for: canIDoStuff & flagList arrays.
  For example: canIDoStuff[Action.clone] is canIDoStuff[0] which represents canClone variable.
*/
export enum Action {
    clone = 0,
    build = 1,
    run = 2
  }
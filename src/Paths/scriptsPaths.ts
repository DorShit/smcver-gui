import { exec } from 'child_process';

export const sMakePath = "/swgwork/nirri/fv-scripts/FVCompile.py";
export const sOnlyPath ="/swgwork/nirri/fv-scripts/SmcverRun.py";
export const clonePath = "/swgwork/nirri/fv-scripts/FVClone.py";
export const gb100CreateFVEnvPath = "/swgwork/nirri/fv-scripts/FVBuildGB100.py";
export const golanFWCreateFVEnvPath = "/swgwork/nirri/fv-scripts/FVBuildGB100.py";
export const pelicanCreateFVEnvPath = "/swgwork/nirri/fv-scripts/FVBuildGB100.py";
export const cexDir = "/latest_run";

export function pullFromGitRepo() {
    const gitRepoPath = 'https://gitlab-master.nvidia.com/fv-fw/fv-scripts.git'; 
    const localDirPath = '/swgwork/dshitrit/test_scripts_for_gui'; 
  
    const command = ` cd ${localDirPath} && git -C ${gitRepoPath} pull`;
  
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Failed to pull from Git repository: ${error.message}`);
        return;
      }
  
      console.log(stdout); // Print the command output
    });
  }
  

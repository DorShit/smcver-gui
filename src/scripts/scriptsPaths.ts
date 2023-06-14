import { exec } from 'child_process';

export const SmakePath = "/swgwork/nirri/fv-scripts/FVCompile.py";
export const SonlyPath ="/swgwork/nirri/fv-scripts/SmcverRun.py";
export const GB100CreateFVEnvPath = "/swgwork/nirri/fv-scripts/FVBuildGB100.py";
export const GolanFWCreateFVEnvPath = "/swgwork/nirri/fv-scripts/FVBuildGB100.py";
export const PelicanCreateFVEnvPath = "/swgwork/nirri/fv-scripts/FVBuildGB100.py";

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
  

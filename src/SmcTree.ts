import * as vscode from 'vscode';
import * as childProcess from 'child_process';
import {onlyCompileFVEnvCommand, runSMcVerCommand, dummyCommand, cloneCommand, createFVCommand} from './Commands';
import {MyTreeItem, IntegerInputTreeItem, HeadlineTreeItem, CheckboxTreeItem, StringInputTreeItem, OptionInputTreeItem} from './TreeItems';
import {compFlags, unrollString, smcverFlags, canIDoStuff, flagList, Action} from './Variables';
import {sMakePath, sOnlyPath, clonePath, gb100CreateFVEnvPath, golanFWCreateFVEnvPath, pelicanCreateFVEnvPath} from './scripts/scriptsPaths';


function hasSpace(str: string): boolean {
  return str.includes(' ');
}

export class SMCFunction {
	constructor(context: vscode.ExtensionContext) {
      const treeDataProvider = new MyTreeDataProvider();
      vscode.window.registerTreeDataProvider('smcverFunctions', treeDataProvider);

      vscode.commands.registerCommand('extension.DummyCommand', () => {});

      vscode.commands.registerCommand('extension.toggleCheckbox', (item: CheckboxTreeItem) => {
        item.value = !item.value;
        item.updateCheckboxState();
        treeDataProvider.refresh(item);
      });

      vscode.commands.registerCommand('extension.UpdateIntegerValueCommand', async (item: IntegerInputTreeItem) => {
        const newValue = await vscode.window.showInputBox({
          prompt: 'Enter Unroll:',
          value: String(item.value),
          validateInput: async (value: string) => {
            const parsedValue = parseInt(value);
            if (isNaN(parsedValue) || !Number.isInteger(parsedValue) || hasSpace(value)) {
              return 'Invalid input. Please enter an integer.';
            }
            if(parsedValue <= 0){
              return 'Unroll has to be greater than 0.';
            }
            if(parsedValue > 999){
              vscode.window.showWarningMessage('High unroll value may cause performance issues.');
            }
            return null;
          }
        });
      
        if (newValue !== undefined) {
          item.value = parseInt(newValue);
          vscode.window.showInformationMessage(`Unroll updated to: ${item.value}.`);
          if(parseInt(newValue) > 999){
            vscode.window.showInformationMessage("Your unroll is really big, consider reducing it.");
          }
          treeDataProvider.refresh(item);
        }
      });

      vscode.commands.registerCommand('extension.UpdateOptionValueCommand', async (item: OptionInputTreeItem) => {
        
        const chosenOption = await vscode.window.showQuickPick(item.options, {
          placeHolder: 'Select an option',
        });
      
        if (chosenOption) {
          item.value = chosenOption;
          item.description = chosenOption;
        } else {
          // User canceled the selection
          console.log('Selection canceled');
        }
        treeDataProvider.refresh(item);
      });

      vscode.commands.registerCommand('extension.UpdateStringValueCommand', async (item: StringInputTreeItem) => {
        const newValue = await vscode.window.showInputBox({
          prompt: item.help,
          value: String(item.value),
          validateInput: (value: string) => {
            if(hasSpace(value)){
              return 'Invalid input. Please enter an valid input.';
            }
            const parsedValue = value;
            return null;
          }
        });
      
        if (newValue !== undefined) {
          const tempVal = item.value;
          item.value = newValue;
          if(newValue === '' ){ // Remove field 
            if(tempVal !== ''){
                vscode.window.showInformationMessage(`Field erased. Please fill again.`);
            }
          }
          else {
            vscode.window.showInformationMessage(`Field updated!`);
          }
          treeDataProvider.refresh(item);
        }
      });

      vscode.commands.registerCommand('extension.CreateFVEnvCommand', (item: MyTreeItem) => {
        var canBuild = canIDoStuff[Action.build];
        if(canBuild !== 0){
          const flagLeft = String(canBuild);
          vscode.window.showErrorMessage('You have ' + flagLeft + ' fields left to fill.');
        }
        else {
            var pythonScriptPath;
            if(item.label === "GPU_FW"){
                pythonScriptPath = gb100CreateFVEnvPath;
            }
            else if(item.label === "GOLAN_FW"){
                pythonScriptPath = golanFWCreateFVEnvPath;
            }
            else if(item.label === "PELICAN"){
                pythonScriptPath = pelicanCreateFVEnvPath;
            }
            const pythonExecutable = 'python3.7'; 
            let flags = flagList[Action.build].join(' ') + " ";
            const command = `${pythonExecutable} ${pythonScriptPath} ${flags}`;
            console.log(flags);

            const outputChannel = vscode.window.createOutputChannel('Create Formal Verification Environment log');
            outputChannel.show();
            vscode.window.showInformationMessage('Build in progress..');
            const child = childProcess.exec(command, (error, stdout, stderr) => {
              if (error) {
                console.error(error);
                vscode.window.showErrorMessage('Failed to run the Python script.');
              } else {
                console.log(stdout);
                console.error(stderr);
                vscode.window.showInformationMessage('Python script executed successfully.');
              }
            });
            if(child.stdout !== null){
              child.stdout.on('data', (data) => {
                console.log(data);
                outputChannel.append(data.toString());
            });
          }
          if(child.stderr !== null){
             child.stderr.on('data', (data) => {
                console.error(data);
                outputChannel.append(data.toString());
            });
          }
        }});

        vscode.commands.registerCommand('extension.CloneCommand', () => {
          var canClone = canIDoStuff[Action.clone];
          if (canClone !== 0) { 
            const flagLeft = String(canClone);
            vscode.window.showErrorMessage('You have ' + flagLeft + ' fields left to fill.');
          } else {
            let flags = flagList[Action.clone].join(' ') + " ";
            const pythonScriptPath = 'python3.7 ' + clonePath;
            const command = ` ${pythonScriptPath} ${flags} `;
            vscode.window.showInformationMessage('Cloning in progress..');
            console.log(command);
        
            const outputChannel = vscode.window.createOutputChannel('Clone log');
            outputChannel.show();
        
            const child = childProcess.exec(command, (error, stdout, stderr) => {
              if (error) {
                console.error(error);
                vscode.window.showErrorMessage('Failed to clone.');
              } else {
                console.log(stdout);
                console.error(stderr);
                vscode.window.showInformationMessage('Cloning finished.');
              }
            });
            if(child.stdout !== null){
                child.stdout.on('data', (data) => {
                  console.log(data);
                  outputChannel.append(data.toString());
              });
            }
            if(child.stderr !== null){
               child.stderr.on('data', (data) => {
                  console.error(data);
                  outputChannel.append(data.toString());
            });
          }
          }
        });

        vscode.commands.registerCommand('extension.OnlyCompileFVEnvCommand', () => {
          var canRunSmcver = canIDoStuff[Action.run];
          if (canRunSmcver !== 0) {
            vscode.window.showErrorMessage('Please fill environment location.');
          } else {
            let flags = compFlags.join(' ');
            flags += flagList[Action.run][0];
            const pythonScriptPath = 'python3.7 ' + sMakePath;
            const command = ` ${pythonScriptPath} ${flags} `;
            vscode.window.showInformationMessage('Compilation in progress..');
            console.log(command);
        
            const outputChannel = vscode.window.createOutputChannel('Compilation log');
            outputChannel.show();
        
            const child = childProcess.exec(command, (error, stdout, stderr) => {
              if (error) {
                console.error(error);
                vscode.window.showErrorMessage('Failed to compile.');
              } else {
                console.log(stdout);
                console.error(stderr);
                vscode.window.showInformationMessage('Compilation finished.');
              }
            });
            if(child.stdout !== null){
                child.stdout.on('data', (data) => {
                  console.log(data);
                  outputChannel.append(data.toString());
              });
            }
            if(child.stderr !== null){
               child.stderr.on('data', (data) => {
                  console.error(data);
                  outputChannel.append(data.toString());
            });
          }
          }
        });

      vscode.commands.registerCommand('extension.RunSMcVerCommand', () => {
        var canRunSmcver = canIDoStuff[Action.run];
        if(canRunSmcver !== 0){
          vscode.window.showErrorMessage('Please fill environment location.');
        }
        else {
          const pythonScriptPath = 'python3.7 ' + sOnlyPath;
          var flags = flagList[Action.run][0];
          flags += " " + smcverFlags.join(' ');
          flags += " " + unrollString[0]; 
          const command = `${pythonScriptPath} ${flags}`;
          vscode.window.showInformationMessage('SMcVer in progress..');
          console.log(command);

          const outputChannel = vscode.window.createOutputChannel('SMcVer Log');
          outputChannel.show();
          const child = childProcess.exec(command, (error, stdout, stderr) => {
                if (error) {
                  console.error(error);
                  vscode.window.showErrorMessage('Failed to run SMcVer.');
                } else {
                  console.log(stdout);
                  console.error(stderr);
                  vscode.window.showInformationMessage('SMcVer run successfully!');
                }
              });

          if(child.stdout !== null){
            child.stdout.on('data', (data) => {
              console.log(data);
              outputChannel.append(data.toString());
          });
        }
        if(child.stderr !== null){
            child.stderr.on('data', (data) => {
              console.error(data);
              outputChannel.append(data.toString());
        });
        }
        }});
  }
}

class MyTreeDataProvider implements vscode.TreeDataProvider<MyTreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<MyTreeItem | CheckboxTreeItem | HeadlineTreeItem | undefined | void> = new vscode.EventEmitter<MyTreeItem | CheckboxTreeItem |  HeadlineTreeItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<MyTreeItem | CheckboxTreeItem | HeadlineTreeItem | undefined | void> = this._onDidChangeTreeData.event;

   getTreeItem(element: MyTreeItem | CheckboxTreeItem | HeadlineTreeItem): vscode.TreeItem {
    return element;
  }
  
    getChildren(element?: MyTreeItem): vscode.ProviderResult<MyTreeItem[]> {
        if (!element) {
          // Root level tree items
          const clone = new MyTreeItem('Clone', vscode.TreeItemCollapsibleState.Collapsed);
          const createFVEnv = new MyTreeItem('Create FV Environment', vscode.TreeItemCollapsibleState.Collapsed);
          const compileRun = new MyTreeItem('Compilation & Run', vscode.TreeItemCollapsibleState.Collapsed);

          return [clone, createFVEnv, compileRun];
        }
        else if(element.label === 'Clone') {
          const cloneItem = new MyTreeItem('Clone me!', vscode.TreeItemCollapsibleState.None, cloneCommand);
          const cloneFlagHeadline = new HeadlineTreeItem('Clone Flags');

          return [cloneItem, cloneFlagHeadline];
        }
        else if(element.label === 'Clone Flags'){
          const clonePathItem = new StringInputTreeItem('Directory Path', '', 'Path to clone directory location.', '--clone_path');
          const optionSystem = ['Switch', 'GPU', 'NIC'];
          const systemNameItem = new OptionInputTreeItem('System Name', 'Choose the system.', optionSystem, '--system_name');
          const optionsProject = ['arava', 'gb100', 'carmel', 'sunbird'];
          const projectNameItem = new OptionInputTreeItem('Project Name', 'Choose the project to compile.', optionsProject, '--project_name');
          const fwMachineItem = new StringInputTreeItem('FW Machine Name', '', 'The name of the fw machine you want to connect.', '--fw_machine');
          const folderNamenItem = new StringInputTreeItem('Folder Name', '', 'The name of the clone folder.', '--folder_name');

          return  [clonePathItem, systemNameItem, projectNameItem, fwMachineItem, folderNamenItem];
        }
        else if(element.label === 'Create FV Environment') {
          const gpuFWItem = new MyTreeItem('GPU_FW', vscode.TreeItemCollapsibleState.None, createFVCommand);
          const golanFWItem = new MyTreeItem('GOLAN_FW', vscode.TreeItemCollapsibleState.None, createFVCommand);
          const pelicanItem = new MyTreeItem('PELICAN', vscode.TreeItemCollapsibleState.None, createFVCommand);
          const flagHeadline = new HeadlineTreeItem('Build Flags');

          return [gpuFWItem, golanFWItem, pelicanItem, flagHeadline];
        }
        else if(element.label === 'Build Flags'){
          const envLocationItem = new StringInputTreeItem('Environment location', '', 'FV environment directory location to be open.', '--env_location', Action.build);
          const envNameItem = new StringInputTreeItem('Environment name', '', 'FV environment name that will be open.', '--env_name', Action.build);
          const functionNameItem = new StringInputTreeItem('Function name', '', 'The name of the function under test.', '--Function_name', Action.build);
          const fileLocationItem = new StringInputTreeItem('File Location', '', 'Exe file location.', '--exe_file', Action.build);
          const cFileNameItem = new StringInputTreeItem('C File Name', '', 'The name of the C file where the function is.', '--c_file_name', Action.build);
          const makeLogLocationItem = new StringInputTreeItem('make.log Location', '', 'The path for the project build log.', '--make_log_location', Action.build);

          return [envLocationItem, envNameItem, functionNameItem, fileLocationItem, cFileNameItem, makeLogLocationItem];
        }
        else if(element.label === 'Compilation & Run'){
          const runSmcverOnlyItem = new MyTreeItem('Run SMcVer', vscode.TreeItemCollapsibleState.None, runSMcVerCommand);
          const compileOnlyItem = new MyTreeItem('Compile', vscode.TreeItemCollapsibleState.None, onlyCompileFVEnvCommand);
          const fVenvLocationItem = new StringInputTreeItem('FV Environment Path', '', 'Absulote path to the FV environment.', '--env_location');
          const firstCompItem = new CheckboxTreeItem('1st Compilation', false, '-first_cmp y', false);
          const flagHeadlineItem = new HeadlineTreeItem('SMcVer Flags');

          return [compileOnlyItem, runSmcverOnlyItem, fVenvLocationItem, firstCompItem, flagHeadlineItem];
        }
        else if(element.label === 'SMcVer Flags'){
          const helpFlagItem = new CheckboxTreeItem('help', false, 'h', false);
          const smcverFlagsHelpFlagItem = new CheckboxTreeItem('help for smcverFlags', false, '-h', true);
          const multiCexFlagItem = new CheckboxTreeItem('multiple counter examples', false, '-multiple_cex', true);
          const noUnwindFlagItem = new CheckboxTreeItem('ignore unroll asserts', false, '-no-unwind-assert', true);
          const disableMemoryTestFlagItem = new CheckboxTreeItem('disable rbw asserts', false, '-disableMemoryTest', true);
          const unrollItem = new IntegerInputTreeItem('Unroll', 32);

          return [helpFlagItem, smcverFlagsHelpFlagItem, multiCexFlagItem, noUnwindFlagItem, disableMemoryTestFlagItem, unrollItem];
          
        }
        return null;
    }
    
      getParent(element: MyTreeItem): vscode.ProviderResult<MyTreeItem> {
        // Return the parent tree item if needed
        return null;
      }

      refresh(item?: MyTreeItem | CheckboxTreeItem | HeadlineTreeItem): void {
        this._onDidChangeTreeData.fire(item);
      }

      refreshAll(): void {
        this._onDidChangeTreeData.fire();
      }
  }

import * as vscode from 'vscode';
import * as childProcess from 'child_process';
import {OnlyCompileFVEnvCommand, RunSMcVerCommand, DummyCommand} from './Commands';
import {MyTreeItem, IntegerInputTreeItem, HeadlineTreeItem, CheckboxTreeItem, StringInputTreeItem, PathInputTreeItem} from './TreeItems';
import {compFlags, unrollString, smcverFlags, createFVEnvFlags, canBuild, canRunSmcver, FVEnvLocation} from './TreeItems';
import {SmakePath, SonlyPath, GB100CreateFVEnvPath, GolanFWCreateFVEnvPath, PelicanCreateFVEnvPath} from './scripts/scriptsPaths';


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

      
      vscode.commands.registerCommand('extension.UpdatePathValueCommand', async (item: PathInputTreeItem) => {
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
        if(canBuild !== 0){
          const flagLeft = String(canBuild);
          vscode.window.showErrorMessage('You have ' + flagLeft + ' fields left to fill.');
        }
        else {
            var pythonScriptPath;
            if(item.label === "GPU_FW"){
                pythonScriptPath = GB100CreateFVEnvPath;
            }
            else if(item.label === "GOLAN_FW"){
                pythonScriptPath = GolanFWCreateFVEnvPath;
            }
            else if(item.label === "PELICAN"){
                pythonScriptPath = PelicanCreateFVEnvPath;
            }
            const pythonExecutable = 'python3.7'; 
            let flags = createFVEnvFlags.join(' ') + " ";
            const command = `${pythonExecutable} ${pythonScriptPath} ${flags}`;
            console.log(flags);
            vscode.window.showInformationMessage('Build in progress..');
            childProcess.exec(command, (error, stdout, stderr) => {
              if (error) {
                console.error(error);
                vscode.window.showErrorMessage('Failed to run the Python script.');
              } else {
                console.log(stdout);
                console.error(stderr);
                vscode.window.showInformationMessage('Python script executed successfully.');
              }
            });
        }});

      vscode.commands.registerCommand('extension.OnlyCompileFVEnvCommand', () => {
        if(canRunSmcver !== 0){
            vscode.window.showErrorMessage('Please fill environment location.');
       }
       else {
            let flags = compFlags.join(' ');
            flags += " --env_location " + FVEnvLocation;
            const pythonScriptPath = 'python3.7 ' + SmakePath;
            const command = ` ${pythonScriptPath} ${flags} `;
            vscode.window.showInformationMessage('Compilation in progress..');
            console.log(command);
            childProcess.exec(command, (error, stdout, stderr) => {
                  if (error) {
                    console.error(error);
                    vscode.window.showErrorMessage('Failed to compile.');
                  } else {
                    console.log(stdout);
                    console.error(stderr);
                    vscode.window.showInformationMessage('Compilation finished.');
                  }
                });
        }});

      vscode.commands.registerCommand('extension.RunSMcVerCommand', () => {
        if(canRunSmcver !== 0){
          vscode.window.showErrorMessage('Please fill environment location.');
        }
        else {
          const pythonScriptPath = 'python3.7 ' + SonlyPath;
          var flags = "--env_location " + FVEnvLocation;
          flags += " " + smcverFlags.join(' ');
          flags += " " + unrollString; 
          const command = `${pythonScriptPath} ${flags}`;
          vscode.window.showInformationMessage('SMcVer in progress..');
          console.log(command);
          childProcess.exec(command, (error, stdout, stderr) => {
                if (error) {
                  console.error(error);
                  vscode.window.showErrorMessage('Failed to run SMcVer.');
                } else {
                  console.log(stdout);
                  console.error(stderr);
                  vscode.window.showInformationMessage('SMcVer run successfully!');
                }
              });
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
          const item1 = new MyTreeItem('Create FV Environment', vscode.TreeItemCollapsibleState.Collapsed, DummyCommand);
          const item2 = new MyTreeItem('Compilation & Run', vscode.TreeItemCollapsibleState.Collapsed, DummyCommand);

          return [item1, item2];
        } 
        else if(element.label === 'Create FV Environment') {
          const gpuFWItem = new MyTreeItem('GPU_FW', vscode.TreeItemCollapsibleState.None);
          const golanFWItem = new MyTreeItem('GOLAN_FW', vscode.TreeItemCollapsibleState.None);
          const pelicanItem = new MyTreeItem('PELICAN', vscode.TreeItemCollapsibleState.None);
          const flagHeadline = new HeadlineTreeItem('Build Flags');

          return [gpuFWItem, golanFWItem, pelicanItem, flagHeadline];
        }
        else if(element.label === 'Build Flags'){
          const envLocationItem = new StringInputTreeItem('Environment location', '', 'FV Environment directory location to be open.', '--env_location');
          const envNameItem = new StringInputTreeItem('Environment name', '', 'FV env name that will be open.', '--env_name');
          const functionNameItem = new StringInputTreeItem('Function name', '', 'The name of the function under test.', '--Function_name');
          const fileLocationItem = new StringInputTreeItem('File Location', '', 'Exe file location.', '--exe_file');
          const cFileNameItem = new StringInputTreeItem('C File Name', '', 'The name of the C file where the function is.', '--c_file_name');
          const makeLogLocationItem = new StringInputTreeItem('make.log Location', '', 'The path for the project build log.', '--make_log_location');

          return [envLocationItem, envNameItem, functionNameItem, fileLocationItem, cFileNameItem, makeLogLocationItem];
        }
        else if(element.label === 'Compilation & Run'){
          const runSmcverOnlyItem = new MyTreeItem('Run SMcVer', vscode.TreeItemCollapsibleState.None, RunSMcVerCommand);
          const compileOnlyItem = new MyTreeItem('Compile', vscode.TreeItemCollapsibleState.None, OnlyCompileFVEnvCommand);
          const FVenvLocationItem = new PathInputTreeItem('FV Environment Path', '', 'Absulote path to the FV environment.');
          const firstCompItem = new CheckboxTreeItem('1st Compilation', false, '-first_cmp y', false);
          const flagHeadlineItem = new HeadlineTreeItem('SMcVer Flags');

          return [compileOnlyItem, runSmcverOnlyItem, FVenvLocationItem, firstCompItem, flagHeadlineItem];
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
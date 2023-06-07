import * as vscode from 'vscode';
import * as childProcess from 'child_process';
import {CreateFVEnvCommand, OnlyCompileFVEnvCommand, CompileRunFVEnvCommand, RunSMcVerCommand} from './Commands';
import {MyTreeItem, IntegerInputTreeItem, HeadlineTreeItem, CheckboxTreeItem, StringInputTreeItem} from './TreeItems';
import {compFlags, unrollString, smcverFlags, createFVEnvFlags, canBuild} from './TreeItems';


function hasSpace(str: string): boolean {
  return str.includes(' ');
}

async function promptYesOrNo(): Promise<boolean> {
  const result = await vscode.window.showInformationMessage(
    'The Unroll is REALLY BIG. Do you want to proceed?',
    { modal: true },
    'Yes',
    'No'
  );

  return result === 'Yes';
}

export class SMCFunction {

	constructor(context: vscode.ExtensionContext) {
      const treeDataProvider = new MyTreeDataProvider();
      vscode.window.registerTreeDataProvider('smcverFunctions', treeDataProvider);

      vscode.commands.registerCommand('extension.CreateFVEnvCommand', (tree: SMCFunction) => {
        if(canBuild !== 0){
          const flagLeft = String(canBuild);
          vscode.window.showErrorMessage('You have ' + flagLeft + ' fields left to fill.');
        }
        else {
            const pythonScriptPath = '../../../../smcver-gui/src/scripts/FvEnvScript.py';
            const pythonExecutable = 'python'; 
            let flags = createFVEnvFlags.join(' ') + " ";
            const command = `${pythonExecutable} "${pythonScriptPath}"`;
            console.log(flags);
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

      vscode.commands.registerCommand('extension.CompileRunFVEnvCommand', () => {
        const pythonScriptPath = '../../../../smcver-gui/src/scripts/Smake.py';
        const pythonExecutable = 'python';
        let flags = compFlags.join(' ');
        flags += " -smcverFlags \" ";
        flags += smcverFlags.join(' ');
        flags += "\"";
        flags += " " + unrollString; 
        const command = `${pythonExecutable} "${pythonScriptPath}"`;
        childProcess.exec(command, (error, stdout, stderr) => {
              if (error) {
                console.error(error);
                vscode.window.showErrorMessage('Failed to run the Python script.');
              } else {
                console.log(stdout);
                console.error(stderr);
                console.log(flags);
              }
            });
          });

      vscode.commands.registerCommand('extension.RunSMcVerCommand', () => {
        const pythonScriptPath = '../../../../smcver-gui/src/scripts/FvEnvScript.py';
        const pythonExecutable = 'python';
        let flags = compFlags.join(' ');
        flags += " -smcverFlags \" ";
        flags += smcverFlags.join(' ');
        flags += "\"";
        flags += " " + unrollString; 
        const command = `${pythonExecutable} "${pythonScriptPath}"`;
        childProcess.exec(command, (error, stdout, stderr) => {
              if (error) {
                console.error(error);
                vscode.window.showErrorMessage('Failed to run the Python script.');
              } else {
                console.log(stdout);
                console.error(stderr);
                console.log(flags);
              }
            });
          });
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
          const item1 = new MyTreeItem('Create FV Environment', vscode.TreeItemCollapsibleState.Collapsed);
          const item2 = new MyTreeItem('Compilation & Run', vscode.TreeItemCollapsibleState.Collapsed);

          return [item1, item2];
        } 
        else if(element.label === 'Create FV Environment') {
          const gpuFWItem = new MyTreeItem('GPU_FW', vscode.TreeItemCollapsibleState.None, CreateFVEnvCommand);
          const golanFWItem = new MyTreeItem('GOLAN_FW', vscode.TreeItemCollapsibleState.None, CreateFVEnvCommand);
          const pelicanItem = new MyTreeItem('PELICAN', vscode.TreeItemCollapsibleState.None, CreateFVEnvCommand);
          const flagHeadline = new HeadlineTreeItem('      BUILD FLAGS');

          return [gpuFWItem, golanFWItem, pelicanItem, flagHeadline];
        }
        else if(element.label === '      BUILD FLAGS'){
          const envLocationItem = new StringInputTreeItem('Environment location', '', 'FV Environment directory location to be open.', '-env_location');
          const envNameItem = new StringInputTreeItem('Environment name', '', 'FV env name that will be open.', '-env_name');
          const functionNameItem = new StringInputTreeItem('Function name', '', 'The name of the function under test.', '-Function_name');
          const fileLocationItem = new StringInputTreeItem('File Location', '', 'Exe file location.', '-exe_file');

          return [envLocationItem, envNameItem, functionNameItem, fileLocationItem];
        }
        else if(element.label === 'Compilation & Run'){
          const runSmcverOnlyItem = new MyTreeItem('Run SMcVer', vscode.TreeItemCollapsibleState.None, RunSMcVerCommand);
          const compileOnlyItem = new MyTreeItem('Compile', vscode.TreeItemCollapsibleState.None, OnlyCompileFVEnvCommand);
          const smcItem = new MyTreeItem('Compile & Run SMcVer', vscode.TreeItemCollapsibleState.None, CompileRunFVEnvCommand);
          const flagHeadline = new HeadlineTreeItem('      SMCVER FLAGS');

          return [runSmcverOnlyItem, compileOnlyItem, smcItem, flagHeadline];
        }
        else if(element.label === '      SMCVER FLAGS'){
          const helpFlagItem = new CheckboxTreeItem('help', false, 'h', false);
          const sanitizedFlagItem = new CheckboxTreeItem('sanitized run', false, 'sanitized', false);
          const intConversionFlagItem = new CheckboxTreeItem('ignore int conversion', false, 'ignore_int_conversion', false);
          const smcverFlagsHelpFlagItem = new CheckboxTreeItem('help for smcverFlags', false, 'h', false);
          const multiCexFlagItem = new CheckboxTreeItem('multiple counter examples', false, 'multiple_cex', true);
          const noUnwindFlagItem = new CheckboxTreeItem('ignore unroll asserts', false, 'no-unwind-assert', true);
          const disableMemoryTestFlagItem = new CheckboxTreeItem('disable rbw asserts', false, 'disableMemoryTest', true);
          const unrollItem = new IntegerInputTreeItem('Unroll', 32);

          return [helpFlagItem, sanitizedFlagItem, intConversionFlagItem, smcverFlagsHelpFlagItem, multiCexFlagItem, noUnwindFlagItem, disableMemoryTestFlagItem, unrollItem];
          
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

/** 
 FunctionView.ts - logic for "Function" tree view. All of the functions we offer will be under the FunctionTree class. 
*/
import * as vscode from 'vscode'; // For vscode extension logic and structs.
import * as childProcess from 'child_process'; // For creating a new process to run commands.
import {onlyCompileFVEnvCommand, runSMcVerCommand, cloneCommand, createFVCommand, updateStringValueCommand, toggleCheckbox, updateIntegerValueCommand, updateOptionValueCommand} from '../Commands';
import {MyTreeItem, IntegerInputTreeItem, HeadlineTreeItem, CheckboxTreeItem, StringInputTreeItem, OptionInputTreeItem} from '../TreeItems';
import {compFlags, unrollString, smcverFlags, canIDoStuff, flagList, Action} from '../Variables';
import {sMakePath, sOnlyPath, clonePath, gb100CreateFVEnvPath, golanFWCreateFVEnvPath, pelicanCreateFVEnvPath} from '../Paths/scriptsPaths';
import {hasSpace} from '../lib/utils';


export class FunctionTree {
/** 
  FunctionTree - The class we use for our "Function" tree view contains:
               * MyTreeDataProvider - All of the tree items we generate.
               * All of the commands we use under "Function" tree view.
*/
	constructor(context: vscode.ExtensionContext) {
      const treeDataProvider = new MyTreeDataProvider();
      vscode.window.registerTreeDataProvider('smcverFunctions', treeDataProvider);

      vscode.commands.registerCommand('extension.DummyCommand', () => {
      /** Dummy command that do nothing. We use it as a default command to tree items that we want to have no action. */
      });

      vscode.commands.registerCommand('extension.toggleCheckbox', (item: CheckboxTreeItem) => {
        /** Command that triggers the updateCheckboxState for the CheckboxTreeItem and than refresh it. */
        item.updateCheckboxState();
        treeDataProvider.refresh(item);
      });

      vscode.commands.registerCommand('extension.UpdateIntegerValueCommand', async (item: IntegerInputTreeItem) => {
      /**
        Command used to update the unroll value. 
        Algo: 1. Open a window to enter an unroll.
              2. Check if the input is a valid number. If so: 
                  a. Check if the number is less than 0. If so:
                    i. Show an error message accordingly. 
                  b.  Check if the number is greater than 999 (can be change to whatever). If so:
                    i. Show a warning message accordingly and anble to insert the input.
                else: 
                  a. Show an error message accordingly.
              3. Update the item value that represents the unroll.
              4. Show a message with the new unroll value.
              5. Check if the value is greater than 999. If so:
                a. Show a warning message.
              6. Refresh the tree item.
      */
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
          item.value = parseInt(newValue); // triggers the method 'set value' at IntegerInputTreeItem.
          vscode.window.showInformationMessage(`Unroll updated to: ${item.value}.`);
          if(parseInt(newValue) > 999){
            vscode.window.showInformationMessage("Your unroll is really big, consider reducing it.");
          }
          treeDataProvider.refresh(item);
        }
      });

      vscode.commands.registerCommand('extension.UpdateOptionValueCommand', async (item: OptionInputTreeItem) => {
        /**
          Command used to pop a window to choose an option represent a flag. 
          Algo: 1. Open a window to choose a flag option.
                2. Update the item value that represents the flag value with the new value.
                4. Refresh the tree item.
        */
        const chosenOption = await vscode.window.showQuickPick(item.options, {
          placeHolder: 'Select an option',
        });
      
        if (chosenOption) {
          item.value = chosenOption; // triggers the method 'set value' at OptionInputTreeItem.
        } 
        treeDataProvider.refresh(item);
      });

      vscode.commands.registerCommand('extension.UpdateStringValueCommand', async (item: StringInputTreeItem) => {
      /**
        Command used for updating a string value for flags. 
        Algo: 1. Open a window to enter the flag value.
              2. Check if the input is a valid (has no spaces, can add more restrictions is wants). If NOT: 
                 a. Show an error message accordingly. 
              3. Update the variable tempVal with the previous item value.
              4. Update the item value that represents the flag value with the new value.
              5. Check if the new value is an empty string. If so: 
                  a. Check if the previous item value is NOT an empty string. If so:
                    i. Show a message that the flag erased and need to be filled again.
                else:
                  a. Show a message that the flag was updated.
              6. Refresh the tree item.
      */
        const newValue = await vscode.window.showInputBox({
          prompt: item.help,
          value: String(item.value),
          validateInput: (value: string) => {
            if(hasSpace(value)){
              return 'Invalid input. Please enter an valid input.';
            }
            return null;
          }
        });
      
        if (newValue !== undefined) {
          const tempVal = item.value;
          item.value = newValue; // Triggers the method 'set value' at StringInputTreeItem.
          if(newValue === ''){ // Remove field 
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
      /**
        Command used for building fv environment script. 
        Algo: 1. Check if we can perform the build by checking the number of flags left to fill. If flags left to fill > 0: 
                 a. Show an error message with the number of flags remains to fill.
              else: 
                 a. Choose the correct script according to the item label.
                 b. Extract the correct flags from the flag array.
                 c. Build the command line.
                 d. Create an output channel.
                 e. Create a process that will execute the command and handles its success or unsuccess.
                 f. Output the log to the output channel.
      */
        var canBuild = canIDoStuff[Action.build]; // Number of flags remains to excute the script.
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
            console.log(item.label);
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
      /**
        Command used for cloning projects. 
        Algo: 1. Check if we can perform cloning by checking the number of flags left to fill. If flags left to fill > 0: 
                 a. Show an error message with the number of flags remains to fill.
              else: 
                 a. Extract the correct flags from the flag array.
                 b. Build the command line.
                 c. Create an output channel.
                 d. Create a process that will execute the command and handles its success or unsuccess.
                 e. Output the log to the output channel.
      */
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
      /**
        Command used for compiling fv environment. 
        Algo: 1. Check if we can compile by checking the number of flags left to fill. If flags left to fill > 0: 
                 a. Show an error message with the number of flags remains to fill.
              else: 
                 a. Extract the correct flags from the flag array.
                 b. Build the command line.
                 c. Create an output channel.
                 d. Create a process that will execute the command and handles its success or unsuccess.
                 e. Output the log to the output channel.
      */
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
      /**
        Command used for running SMcVer. 
        Algo: 1. Check if we can eun SMcVer by checking the number of flags left to fill. If flags left to fill > 0: 
                 a. Show an error message with the number of flags remains to fill.
              else: 
                 a. Extract the correct flags from the flag array.
                 b. Build the command line.
                 c. Create an output channel.
                 d. Create a process that will execute the command and handles its success or unsuccess.
                 e. Output the log to the output channel.
      */
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
  /** 
    MyTreeDataProvider - The class we use for generating our tree items. 
  */

  /** _onDidChangeTreeData is used at refresh function with the method fire. It will re-generate MyTreeDataProvider again. */
  private _onDidChangeTreeData: vscode.EventEmitter<MyTreeItem | CheckboxTreeItem | HeadlineTreeItem | undefined | void> = new vscode.EventEmitter<MyTreeItem | CheckboxTreeItem |  HeadlineTreeItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<MyTreeItem | CheckboxTreeItem | HeadlineTreeItem | undefined | void> = this._onDidChangeTreeData.event;

   getTreeItem(element: MyTreeItem): vscode.TreeItem {
    /** 
      input: tree item.
      output: Same tree item.
    */
    return element;
  }
  
  getChildren(element?: MyTreeItem): vscode.ProviderResult<MyTreeItem[]> {
    /** 
      getChildren - Incharge of the hierarchy of our tree view. For each tree item we generate here the function, getChildren, will be recursive called with the item. If we want to add "children"
      to a tree item we will generate new tree items when identifing the correct item (Here I did it as: element.label === <tree item label>).
      
      input: tree item or undefined.
      output: list of tree items. 
    */
      if (!element) { // Root level tree items
        const clone = new MyTreeItem('Clone', vscode.TreeItemCollapsibleState.Collapsed);
        const createFVEnv = new MyTreeItem('Create FV Environment', vscode.TreeItemCollapsibleState.Collapsed);
        const compileRun = new MyTreeItem('Compilation & Run', vscode.TreeItemCollapsibleState.Collapsed);

        return [clone, createFVEnv, compileRun];
      }
      else if(element.label === 'Clone') { // All The tree items under Clone: Clone me! button & Clone Flags and all of it's childrens (tree items flags).
        const cloneItem = new MyTreeItem('Clone me!', vscode.TreeItemCollapsibleState.None, cloneCommand);
        const cloneFlagHeadline = new HeadlineTreeItem('Clone Flags');

        return [cloneItem, cloneFlagHeadline];
      }
      else if(element.label === 'Clone Flags'){ // All the flags for cloning represented as tree items. StringInputTreeItem for free input, OptionInputTreeItem for choosing from a set of options.
        const clonePathItem = new StringInputTreeItem('Directory Path', '', 'Path to clone directory location.', '--clone_path', updateStringValueCommand);
        const optionSystem = ['Switch', 'GPU', 'NIC']; // Options to choose from. We pass them to the constructor of OptionInputTreeItem.
        const systemNameItem = new OptionInputTreeItem('System Name', 'Choose the system.', optionSystem, '--system_name', updateOptionValueCommand);
        const optionsProject = ['arava', 'gb100', 'carmel', 'sunbird']; // Options to choose from. We pass them to the constructor of OptionInputTreeItem.
        const projectNameItem = new OptionInputTreeItem('Project Name', 'Choose the project to compile.', optionsProject, '--project_name', updateOptionValueCommand, Action.clone, true);
        const fwMachineItem = new StringInputTreeItem('FW Machine Name', '', 'The name of the fw machine you want to connect.', '--fw_machine', updateStringValueCommand, Action.clone, true);
        const folderNamenItem = new StringInputTreeItem('Folder Name', '', 'The name of the clone folder.', '--folder_name', updateStringValueCommand, Action.clone, true);

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
        const envLocationItem = new StringInputTreeItem('Environment location', '', 'FV environment directory location to be open.', '--env_location', updateStringValueCommand, Action.build);
        const envNameItem = new StringInputTreeItem('Environment name', '', 'FV environment name that will be open.', '--env_name', updateStringValueCommand, Action.build);
        const functionNameItem = new StringInputTreeItem('Function name', '', 'The name of the function under test.', '--Function_name', updateStringValueCommand, Action.build);
        const fileLocationItem = new StringInputTreeItem('File Location', '', 'Exe file location.', '--exe_file', updateStringValueCommand, Action.build);
        const cFileNameItem = new StringInputTreeItem('C File Name', '', 'The name of the C file where the function is.', '--c_file_name', updateStringValueCommand, Action.build);
        const makeLogLocationItem = new StringInputTreeItem('make.log Location', '', 'The path for the project build log.', '--make_log_location', updateStringValueCommand, Action.build);

        return [envLocationItem, envNameItem, functionNameItem, fileLocationItem, cFileNameItem, makeLogLocationItem];
      }
      else if(element.label === 'Compilation & Run'){
        const runSmcverOnlyItem = new MyTreeItem('Run SMcVer', vscode.TreeItemCollapsibleState.None, runSMcVerCommand);
        const compileOnlyItem = new MyTreeItem('Compile', vscode.TreeItemCollapsibleState.None, onlyCompileFVEnvCommand);
        const fVenvLocationItem = new StringInputTreeItem('FV Environment Path', '', 'Absulote path to the FV environment.', '--env_location', updateStringValueCommand, Action.run);
        const firstCompItem = new CheckboxTreeItem('1st Compilation', false, '-first_cmp y', false, toggleCheckbox);
        const flagHeadlineItem = new HeadlineTreeItem('SMcVer Flags');

        return [compileOnlyItem, runSmcverOnlyItem, fVenvLocationItem, firstCompItem, flagHeadlineItem];
      }
      else if(element.label === 'SMcVer Flags'){
        const helpFlagItem = new CheckboxTreeItem('help', false, 'h', false, toggleCheckbox);
        const smcverFlagsHelpFlagItem = new CheckboxTreeItem('help for smcverFlags', false, '-h', true, toggleCheckbox);
        const multiCexFlagItem = new CheckboxTreeItem('multiple counter examples', false, '-multiple_cex', true, toggleCheckbox);
        const noUnwindFlagItem = new CheckboxTreeItem('ignore unroll asserts', false, '-no-unwind-assert', true,toggleCheckbox);
        const disableMemoryTestFlagItem = new CheckboxTreeItem('disable rbw asserts', false, '-disableMemoryTest', true, toggleCheckbox);
        const unrollItem = new IntegerInputTreeItem('Unroll', 32, updateIntegerValueCommand);

        return [helpFlagItem, smcverFlagsHelpFlagItem, multiCexFlagItem, noUnwindFlagItem, disableMemoryTestFlagItem, unrollItem];  
      }
      return null;
  }
  
  refresh(item?: MyTreeItem): void {
    /** Triggers _onDidChangeTreeData.fire() to re-generate the tree item we get as an input. */
    this._onDidChangeTreeData.fire(item);
  }

  refreshAll(): void {
  /** Triggers _onDidChangeTreeData.fire() to re-generate MyTreeDataProvider. */
    this._onDidChangeTreeData.fire();
  }
}
/** 
   CexView.ts - logic for "Counter Example" tree view: 
              * All the counter exmaples will be presented from the user fv location/latest_run
              * Refresh button that will check again at the dir for the counter examples - smcverCEX.refreshEntry command.
              * Edit button that will take a path as input and will present all the counter examples at the path/latest_run if there are - smcverCEX.editEntry.
*/
import * as vscode from 'vscode'; // For vscode extension logic and structs.
import * as childProcess from 'child_process'; // For creating a new process to run commands.
import * as fs from 'fs'; // For reading file systems (use for reading latets_run directory).

import {MyTreeItem, CEXTreeItem, HeadlineTreeItem} from '../TreeItems';
import {dummyCommand, loadCounterExampleCommand} from '../Commands';
import {fvEnvironmentLocation} from '../Variables';
import {hasSpace, removeFrom, removeUntil, isCex} from '../lib/utils';
import {cexDir} from '../Paths/scriptsPaths';

export class CEXTree {
/** 
  CEXTree - The class we use for our "Counter Example" tree view contains:
            * MyTreeDataProvider - All of the tree items we generate.
            * All of the commands we use under "Counter Example" tree view.
  The class has 2 private variables: 
            * fvPath - The last path the user insert under the edit button OR the FV Environment Path flag at the FunctionView.ts.  
            * fvLastEnvLocation - The last path the user insert the FV Environment Path flag at the FunctionView.ts. This variable exists
              to let the user edit the path from the edit button and NOT runover the FV Environment Path flag.
*/
  private fvPath: string;
  private fvLastEnvLocation: string;
	constructor(context: vscode.ExtensionContext) {
    this.fvPath = "";
    this.fvLastEnvLocation = "";
    const treeDataProvider = new FileTreeDataProvider("");
    vscode.window.registerTreeDataProvider('smcverCEX', treeDataProvider);

    vscode.commands.registerCommand('smcverCEX.refreshEntry',  () => {
      if(fvEnvironmentLocation[0] === undefined && this.fvPath === "") {return;}
      else if(fvEnvironmentLocation[0] !== undefined && this.fvPath !== ""){
        if(this.fvLastEnvLocation !== fvEnvironmentLocation[0]){
          this.fvPath = removeUntil(fvEnvironmentLocation[0], '/');
          this.fvLastEnvLocation = fvEnvironmentLocation[0];
          const pathToCex = `${this.fvPath}${cexDir}`;
          treeDataProvider.refresh(pathToCex);
        }
        else {
          const pathToCex = `${this.fvPath}${cexDir}`;
          treeDataProvider.refresh(pathToCex);
        }
      }
      else if(fvEnvironmentLocation[0] !== undefined){
        this.fvPath = removeUntil(fvEnvironmentLocation[0], '/');
        this.fvLastEnvLocation = fvEnvironmentLocation[0];
        const pathToCex = `${this.fvPath}${cexDir}`;
        treeDataProvider.refresh(pathToCex);
      }
      else if(this.fvPath !== ""){
        const pathToCex = `${this.fvPath}${cexDir}`;
        treeDataProvider.refresh(pathToCex);
      }
    });

    vscode.commands.registerCommand('smcverCEX.editEntry', async () => {
     /**
      Command that update the counter examples directory location. 
      Algo: 1. Open a window to enter counter example dir path.
            2. Check if the input is a valid (has no spaces, can add more restrictions is wants). If NOT: 
                a. Show an error message accordingly. 
            3. Update the variable fvPath with the new path.
            4. Update the item value that represents the flag value with the new value.
            5. Refresh the tree view (smcverCex) with the input: path + /latest_run.
    */
        const path = await vscode.window.showInputBox({
            prompt: "Path to counter examples",
            value: String(this.fvPath),
            validateInput: (value: string) => {
              if(hasSpace(value)){
                return 'Invalid input. Please enter an valid input.';
              }
              const parsedValue = value;
              return null;
            }
          });
        if(path === undefined){return;}
        this.fvPath = path;
        const pathToCex = `${path}${cexDir}`;
        treeDataProvider.refresh(pathToCex);
    });

    vscode.commands.registerCommand('extension.LoadCounterExampleCommand', (item: CEXTreeItem) => {
    /**
      Currently just run a command that will re-build the program.
      TODO: Run a debugger with a counter example according to the item we get as an input. 
    */
        const cex = item.counterExample;
        const buildCommand = `cd ${this.fvPath} && cmake --build build`;
        console.log(buildCommand);
        const child = childProcess.exec(buildCommand, (error, stdout, stderr) => {
            if (error) {
              console.error(error);
              vscode.window.showErrorMessage('Failed.');
            } else {
              console.log(stdout);
              console.error(stderr);
              vscode.window.showInformationMessage('Success.');
            }
          });
    });
  }
}

class FileTreeDataProvider implements vscode.TreeDataProvider<MyTreeItem | CEXTreeItem | HeadlineTreeItem | void> {
/** 
  FileTreeDataProvider - The class we use for generating our counter examples tree items. 
  The class has 1 variable: * _rootPath - The path we look for the counter exmaples.
*/
    private _rootPath: string;
    /** _onDidChangeTreeData is used at refresh function with the method fire. It will re-generate FileTreeDataProvider again. */
    private _onDidChangeTreeData: vscode.EventEmitter<MyTreeItem | CEXTreeItem | HeadlineTreeItem | undefined | void> = new vscode.EventEmitter<MyTreeItem | CEXTreeItem | HeadlineTreeItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<MyTreeItem | CEXTreeItem | HeadlineTreeItem | undefined | void> = this._onDidChangeTreeData.event;
  
    constructor(rootPath: string) {
      this._rootPath = rootPath;
    }

    getTreeItem(element: CEXTreeItem | MyTreeItem): vscode.TreeItem {
    /** 
      input: tree item.
      output: Same tree item.
    */
      return element;
    }
  
    getChildren(): vscode.ProviderResult<MyTreeItem[]> {
    /**
      Incharge of the hierarchy of our tree view. In this case, we will look at the _rootPath variable and make every cex file
      as a tree item.
      
      input: none.
      output: 3 Cases: 
                      * _rootPath is empty --> tree item that indicate no path to look from.
                      * _rootPath is a valid path for counter examples --> 1. List of all the counter examples as tree items.
                                                                           2. If there are no counter examples files, 1 tree item indiactes PASS.
                      * _rootPath isn't a valid path for counter example --> an error message and an empty tree view.
    */
      if(this._rootPath === "") {
          const noPathItem = new MyTreeItem("No path insert yet.", vscode.TreeItemCollapsibleState.None, dummyCommand);
          return [noPathItem];
      }
      return new Promise((resolve, reject) => {
      fs.readdir(this._rootPath, (err, files) => {
          if (err) {
              return reject(err);
          }
          var fileItems: CEXTreeItem[];
          fileItems = files.map(file =>  new CEXTreeItem(removeFrom(file, '.'), file, loadCounterExampleCommand)).filter(file => isCex(file.label) === true);
          if(fileItems.length === 0){
              var passItems: MyTreeItem[] = [];
              var passItem = new MyTreeItem("PASS", vscode.TreeItemCollapsibleState.None, dummyCommand);
              passItems.push(passItem);
              resolve(passItems);
          }
          else {
              resolve(fileItems);
          }
      });
      });
    }

    refresh(path: string): void {
    /** Triggers _onDidChangeTreeData.fire() to re-generate FileTreeDataProvider with the new path we get as an input. */
      this._rootPath = path;
      this._onDidChangeTreeData.fire();
    }
    
}
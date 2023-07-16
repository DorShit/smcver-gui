import * as vscode from 'vscode';
import * as childProcess from 'child_process';
import * as fs from 'fs';

import {MyTreeItem, CEXTreeItem, HeadlineTreeItem} from './TreeItems';
import {dummyCommand, loadCounterExampleCommand} from './Commands';
import {fvEnvironmentLocation} from './Variables';
import {hasSpace, removeFrom, removeUntil, isCex} from './lib/utils';
import {cexDir} from './Paths/scriptsPaths';


export class CEXTree {
    public fvPath: string;
	constructor(context: vscode.ExtensionContext) {
        this.fvPath = "";
        const treeDataProvider = new FileTreeDataProvider("");
        vscode.window.registerTreeDataProvider('smcverCEX', treeDataProvider);

         vscode.commands.registerCommand('smcverCEX.refreshEntry',  () => {
            if(fvEnvironmentLocation[0] === undefined) {return;}
            this.fvPath = removeUntil(fvEnvironmentLocation[0], '/');
            const pathToCex = `${this.fvPath}${cexDir}`;
            treeDataProvider.refresh(pathToCex);
        });

        vscode.commands.registerCommand('smcverCEX.editEntry', async () => {
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
    private _rootPath: string;
    private _onDidChangeTreeData: vscode.EventEmitter<MyTreeItem | CEXTreeItem | HeadlineTreeItem | undefined | void> = new vscode.EventEmitter<MyTreeItem | CEXTreeItem | HeadlineTreeItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<MyTreeItem | CEXTreeItem | HeadlineTreeItem | undefined | void> = this._onDidChangeTreeData.event;
  
    constructor(rootPath: string) {
      this._rootPath = rootPath;
    }
  
    refresh(path: string): void {
      this._rootPath = path;
      this._onDidChangeTreeData.fire();
    }
  
    getTreeItem(element: CEXTreeItem | MyTreeItem): vscode.TreeItem {
      return element;
    }
  
    getChildren(): vscode.ProviderResult<MyTreeItem[]> {
        if(this._rootPath === "") {
            const noPathItem = new MyTreeItem("No Path", vscode.TreeItemCollapsibleState.None, dummyCommand);
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
  }
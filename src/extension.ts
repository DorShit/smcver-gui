/**
  extension.ts - This is the main file. Was created by vscode extension plugin.
 */
  import * as vscode from 'vscode'; // The module 'vscode' contains the VS Code extensibility API
  import {FunctionTree} from './TreeViews/FunctionView';
  import {CEXTree} from './TreeViews/CexView';
  
  /**
    This method is called when your extension is activated
    Your extension is activated the very first time the command is executed
  */
  export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "smcver-gui" is now active!');
    new FunctionTree(context);
    new CEXTree(context);
  }
  
  /** This method is called when your extension is deactivated */ 
  export function deactivate() {}
  
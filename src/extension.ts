// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { SMCFunction } from './SmcTree';
import * as childProcess from 'child_process';
import {CreateFVEnvCommand, OnlyCompileFVEnvCommand, CompileRunFVEnvCommand, RunSMcVerCommand} from './Commands';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "smcver-gui" is now active!');
	new SMCFunction(context);
}

// This method is called when your extension is deactivated
export function deactivate() {}

import * as vscode from 'vscode';

export const CreateFVEnvCommand: vscode.Command = {
    title: 'CreateFVEnvCommand',
    command: 'extension.CreateFVEnvCommand',
  };

export const OnlyCompileFVEnvCommand: vscode.Command = {
    title: 'OnlyCompileFVEnvCommand',
    command: 'extension.OnlyCompileFVEnvCommand',
  };

export const CompileRunFVEnvCommand: vscode.Command = {
    title: 'CompileRunFVEnvCommand',
    command: 'extension.CompileRunFVEnvCommand',
  };

export const RunSMcVerCommand: vscode.Command = {
    title: 'RunSMcVerCommand',
    command: 'extension.RunSMcVerCommand',
  };

  module.exports = {CreateFVEnvCommand, OnlyCompileFVEnvCommand, CompileRunFVEnvCommand, RunSMcVerCommand};
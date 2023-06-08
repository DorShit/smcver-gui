import * as vscode from 'vscode';

export const OnlyCompileFVEnvCommand: vscode.Command = {
    title: 'OnlyCompileFVEnvCommand',
    command: 'extension.OnlyCompileFVEnvCommand',
  };

export const RunSMcVerCommand: vscode.Command = {
    title: 'RunSMcVerCommand',
    command: 'extension.RunSMcVerCommand',
  };

export const DummyCommand: vscode.Command = {
    title: 'DummyCommand',
    command: 'extension.DummyCommand',
  };

  module.exports = {OnlyCompileFVEnvCommand, RunSMcVerCommand, DummyCommand};
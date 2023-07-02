import * as vscode from 'vscode';

export const onlyCompileFVEnvCommand: vscode.Command = {
    title: 'OnlyCompileFVEnvCommand',
    command: 'extension.OnlyCompileFVEnvCommand',
  };

export const runSMcVerCommand: vscode.Command = {
    title: 'RunSMcVerCommand',
    command: 'extension.RunSMcVerCommand',
  };

  export const cloneCommand: vscode.Command = {
    title: 'CloneCommand',
    command: 'extension.CloneCommand',
  };

  export const createFVCommand: vscode.Command = {
    title: 'CreateFVCommand',
    command: 'extension.CreateFVEnvCommand'
  }

export const dummyCommand: vscode.Command = {
    title: 'DummyCommand',
    command: 'extension.DummyCommand',
  };

  module.exports = {onlyCompileFVEnvCommand, runSMcVerCommand, dummyCommand, cloneCommand, createFVCommand};
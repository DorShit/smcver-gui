/**
  Commands.ts - Declaration ONLY of all of our commands.
*/
import * as vscode from 'vscode'; // For vscode extension logic and structs.

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
};

export const updateStringValueCommand: vscode.Command ={
    command: 'extension.UpdateStringValueCommand',
    title: 'Input '
};

export const toggleCheckbox: vscode.Command = {
    command: 'extension.toggleCheckbox',
    title: 'Toggle Checkbox'
};

export const updateIntegerValueCommand: vscode.Command = {
    command: 'extension.UpdateIntegerValueCommand',
    title: 'Input unroll'
};

export const updateOptionValueCommand: vscode.Command = {
    command: 'extension.UpdateOptionValueCommand',
    title: 'Option Command'
};

export const loadCounterExampleCommand: vscode.Command = {
    command: 'extension.LoadCounterExampleCommand',
    title: 'Load CEX'
};

export const dummyCommand: vscode.Command = {
    title: 'DummyCommand',
    command: 'extension.DummyCommand',
};

module.exports = {onlyCompileFVEnvCommand, runSMcVerCommand, dummyCommand, cloneCommand, createFVCommand, updateStringValueCommand, toggleCheckbox, updateIntegerValueCommand, updateOptionValueCommand, loadCounterExampleCommand};
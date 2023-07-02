import * as vscode from 'vscode';

import {compFlags, unrollString, smcverFlags, createFVEnvFlags, canIDoStuff, flagList, Action} from './Variables';
import {dummyCommand} from './Commands';

export class MyTreeItem extends vscode.TreeItem {
  public func: Action;
  public isOptinal: boolean;
  constructor(label: string, collapsibleState: vscode.TreeItemCollapsibleState, command?: vscode.Command, func?: Action, isOptinal?: boolean) {
    super(label, collapsibleState);
    if(func){
      this.func = func;
    }
    else {
      this.func = Action.clone;
    }

    if(command) {
      this.command = {
        command: command.command,
        title: command.title,
        arguments: [this]
      };
    }
    else {
      this.command = dummyCommand;
    }
    if(isOptinal){
      this.isOptinal = isOptinal;
    }
    else{
      this.isOptinal = false;
    }
  }
}

export class OptionInputTreeItem extends MyTreeItem {
  private _value: string;
  public options: string[];
  public flag: string;

  constructor(label: string, help: string, options: string[], flag: string, command?: vscode.Command, func?: Action, isOptinal?: boolean) {
    super(label, vscode.TreeItemCollapsibleState.None, command, func, isOptinal);
    this._value = "";
    this.flag = flag;
    this.options = options;
    this.description = '...';
    this.tooltip = help;
    this.iconPath = new vscode.ThemeIcon('edit');
  }

  get value(): string {
    return this._value;
  }

  set value(newValue: string) {
    this._value = newValue;
    this.description = newValue;
    this.iconPath = new vscode.ThemeIcon('notebook-state-success');
    this.tooltip = newValue;
    if(flagList[this.func].length > 0){
      const indexToRemove = createFVEnvFlags.indexOf(this.flag + " " + this._value);
      if (indexToRemove !== -1) {
        flagList[this.func].splice(indexToRemove, 1);
        if(this.isOptinal === false){
            canIDoStuff[this.func]++;
        }
      }
    } 
    flagList[this.func].push(this.flag + " " + this._value);
    if(this.isOptinal === false){
      canIDoStuff[this.func]--;
    }
  }
}

export class IntegerInputTreeItem extends MyTreeItem {
  private _value: number;

  constructor(label: string, value: number, command?: vscode.Command) {
    super(label, vscode.TreeItemCollapsibleState.None, command);
    this._value = value;
    this.description = String(value);
  }

  get value(): number {
    return this._value;
  }

  set value(newValue: number) {
    this._value = newValue;
    this.description = String(newValue);
    unrollString[0] = "--u " + this.description;
  }
}

export class StringInputTreeItem extends MyTreeItem {
    private _value: string;
    help: string;
    flag: string;
    isWritten: boolean;
  
    constructor(label: string, value: string, help: string, flag: string, command?: vscode.Command, func?: Action, isOptinal?: boolean) {
      super(label, vscode.TreeItemCollapsibleState.None, command, func, isOptinal);
      this._value = value;
      this.help = help;
      this.flag = flag;
      this.isWritten = false;
      this.iconPath = new vscode.ThemeIcon('edit');
      this.tooltip = help;
      this.description = '...';
    }
  
    get value(): string {
      return this._value;
    }
  
    set value(newValue: string) {
        if(!this.isWritten){ 
          if(this.isOptinal === false){
            canIDoStuff[this.func]--;
          }
          this.isWritten = true;
          this.iconPath = new vscode.ThemeIcon('notebook-state-success');
          this.description = '';
        }
        else{
            if(flagList[this.func].length > 0){
                const indexToRemove = flagList[this.func].indexOf(this.flag + " " + this._value);
                if (indexToRemove !== -1) {
                  flagList[this.func].splice(indexToRemove, 1);
                }
            }
        }
        this._value = newValue;
        if(newValue === ''){ // turn off
          this.iconPath = new vscode.ThemeIcon('edit');
            this.tooltip = this.help;
            if(this.isOptinal === false){
              canIDoStuff[this.func]++;
            }
            this.isWritten = false;
            this.description = '...';
        }
        else {
            this.iconPath = new vscode.ThemeIcon('notebook-state-success');
            this.tooltip = newValue;
            flagList[this.func].push(this.flag + " " + newValue);
        }
    }
}

export class HeadlineTreeItem extends MyTreeItem {
  constructor(label: string) {
    super(label, vscode.TreeItemCollapsibleState.Collapsed);
    this.contextValue = 'headlineTreeItem';
    this.iconPath = new vscode.ThemeIcon('checklist');
    this.command = undefined; // Disable click
    this.tooltip = ''; // Disable hover
  }
}

export class CheckboxTreeItem extends MyTreeItem {
  value: boolean;
  initFlag: string;
  isSmcverFlag: boolean;

  constructor(label: string, value: boolean, flag: string,  isSmcverFlag: boolean, command?: vscode.Command) {
    super(label, vscode.TreeItemCollapsibleState.None, command);
    this.value = value;
    this.initFlag = "-"+flag;
    this.isSmcverFlag = isSmcverFlag;
    this.contextValue = 'checkboxTreeItem';
    this.tooltip = 'Add';
    this.updateCheckboxState();
  }

    updateCheckboxState(): void {
    if (this.value) {
      this.iconPath = new vscode.ThemeIcon('notebook-state-success');
      if(this.isSmcverFlag){
        smcverFlags.push(this.initFlag);
      }
      else{
        compFlags.push(this.initFlag);
      }
      this.tooltip = 'Remove';
    } else {
      this.iconPath = new vscode.ThemeIcon('error-small');
      if(this.isSmcverFlag){
        if(smcverFlags.length > 0){
          const indexToRemove = smcverFlags.indexOf(this.initFlag);
          if (indexToRemove !== -1) {
            smcverFlags.splice(indexToRemove, 1);
          }
        }
      }
      else {
      if(compFlags.length > 0){
        const indexToRemove = compFlags.indexOf(this.initFlag);
        if (indexToRemove !== -1) {
          compFlags.splice(indexToRemove, 1);
        }
      }
    }
    this.tooltip = 'Add';
    }
  }
}
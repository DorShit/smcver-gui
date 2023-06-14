import * as vscode from 'vscode';

export const compFlags: string [] = [];
export var unrollString :string = "--u 32";
export const smcverFlags: string [] = [];
export var createFVEnvFlags: string [] = [];
export var canBuild = 6;
export var canRunSmcver = 1;
export var FVEnvLocation: string;

export class MyTreeItem extends vscode.TreeItem {
  constructor(label: string, collapsibleState: vscode.TreeItemCollapsibleState, command?: vscode.Command) {
    super(label, collapsibleState);
    if(command) {
      this.command = command;
    }
    else {
      this.command = {
        title: 'CreateFVEnvCommand',
        command: 'extension.CreateFVEnvCommand',
        arguments: [this]
      };
    
    }
  }
}

export class IntegerInputTreeItem extends MyTreeItem {
  private _value: number;

  constructor(label: string, value: number, command?: vscode.Command) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this._value = value;
    this.description = String(value);
    this.command = {
      command: 'extension.UpdateIntegerValueCommand',
      title: 'Input unroll',
      arguments: [this],
    };
  }

  get value(): number {
    return this._value;
  }

  set value(newValue: number) {
    this._value = newValue;
    this.description = String(newValue);
    unrollString = "--u " + this.description;
  }
}

export class PathInputTreeItem extends MyTreeItem {
  private _value: string;
  help: string;
  isWritten: boolean;

  constructor(label: string, value: string, help: string, command?: vscode.Command) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this._value = value;
    this.help = help;
    this.isWritten = false;
    this.iconPath = new vscode.ThemeIcon('edit');
    this.description = '...'
    this.tooltip = help;
    this.command = {
      command: 'extension.UpdatePathValueCommand',
      title: 'Input ',
      arguments: [this],
    };
  }

  get value(): string {
    return this._value;
  }

  set value(newValue: string) {
      if(!this.isWritten){ 
          canRunSmcver--;
          this.isWritten = true;
          this.iconPath = new vscode.ThemeIcon('notebook-state-success');
          this.description = '';
      }
      this._value = newValue;
      FVEnvLocation = newValue;
      if(newValue === ''){ // turn off
        this.iconPath = new vscode.ThemeIcon('edit');
          this.tooltip = this.help;
          canRunSmcver++;
          this.isWritten = false;
          this.description = '...';
      }
      else {
          this.iconPath = new vscode.ThemeIcon('notebook-state-success');
          this.tooltip = newValue;
      }
  }
}

export class StringInputTreeItem extends MyTreeItem {
    private _value: string;
    help: string;
    flag: string;
    isWritten: boolean;
  
    constructor(label: string, value: string, help: string, flag: string, command?: vscode.Command) {
      super(label, vscode.TreeItemCollapsibleState.None);
      this._value = value;
      this.help = help;
      this.flag = flag;
      this.isWritten = false;
      this.iconPath = new vscode.ThemeIcon('edit');
      this.tooltip = help;
      this.description = '...';
      this.command = {
        command: 'extension.UpdateStringValueCommand',
        title: 'Input ',
        arguments: [this],
      };
    }
  
    get value(): string {
      return this._value;
    }
  
    set value(newValue: string) {
        if(!this.isWritten){ 
            canBuild--;
            this.isWritten = true;
            this.iconPath = new vscode.ThemeIcon('notebook-state-success');
            this.description = '';
        }
        else{
            if(createFVEnvFlags.length > 0){
                const indexToRemove = createFVEnvFlags.indexOf(this.flag + " " + this._value);
                if (indexToRemove !== -1) {
                    createFVEnvFlags.splice(indexToRemove, 1);
                }
            }
        }
        this._value = newValue;
        if(newValue === ''){ // turn off
          this.iconPath = new vscode.ThemeIcon('edit');
            this.tooltip = this.help;
            canBuild++;
            this.isWritten = false;
            this.description = '...';
        }
        else {
            this.iconPath = new vscode.ThemeIcon('notebook-state-success');
            this.tooltip = newValue;
            createFVEnvFlags.push(this.flag + " " + newValue);
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
    super(label, vscode.TreeItemCollapsibleState.None);
    this.value = value;
    this.initFlag = "-"+flag;
    this.isSmcverFlag = isSmcverFlag;
    this.contextValue = 'checkboxTreeItem';
    this.tooltip = 'Add';
    this.command = {
      command: 'extension.toggleCheckbox',
      title: 'Toggle Checkbox',
      arguments: [this],
    };
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
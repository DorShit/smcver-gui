/**
  TreeItems.ts - All of the tree items class for our treeview:
               * MyTreeItem - generic tree item.
               * OptionInputTreeItem - for a flag that you choose from a list of options.
               * IntegerInputTreeItem - for integer input. Currently use only for unroll flag.
               * StringInputTreeItem - for string input. Use for build flags, clone flags, fv environment & cex location.
               * HeadlineTreeItem - for headline purpose only. Use to indicate the flags for each action.
               * CheckboxTreeItem - for flags we can choose to add. Use for smcver run flags (multiple_cex, disableMemoryTest, etc..) and for 1st compile flag.
               * CEXTreeItem - for counter example file. TODO: Use for debuging the specific counter example (currently not implemented).
*/
import * as vscode from 'vscode'; // For vscode extension logic and structs.
import {compFlags, unrollString, smcverFlags, createFVEnvFlags, canIDoStuff, flagList, Action} from './Variables';
import {dummyCommand} from './Commands';

export class MyTreeItem extends vscode.TreeItem {
  public action: Action;
  public isOptinal: boolean;
  constructor(label: string, collapsibleState: vscode.TreeItemCollapsibleState, command?: vscode.Command, action?: Action, isOptinal?: boolean) {
    super(label, collapsibleState);
    if(action){
      this.action = action;
    }
    else {
      this.action = Action.clone;
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

  constructor(label: string, help: string, options: string[], flag: string, command?: vscode.Command, action?: Action, isOptinal?: boolean) {
    super(label, vscode.TreeItemCollapsibleState.None, command, action, isOptinal);
    this._value = "";
    this.flag = flag;
    this.options = options;
    this.description = '...';
    this.tooltip = help;
    if(this.isOptinal){
      this.tooltip += " (OPTINAL)"; 
    }
    this.iconPath = new vscode.ThemeIcon('edit');
  }
  /** Function when calling to: <> = item.value; */
  get value(): string {
    return this._value;
  }

  /** Function when calling to: item.value = <>; 
    Algo: 1. Change the value to the new value.
          2. Change the description to the new value.
          3. Change the icon to 'V'.
          4. Check if we have the flag in the flag array according to action variable. If so:
            a. Remove the flag from the array.
            b. Increase the counter according to action and optinal variables.
          5. Add the new flag to the flag array according to action variable.
          6. Decrease the counter according to action and optinal variables.
  */
  set value(newValue: string) {
    this._value = newValue;
    this.description = newValue;
    this.tooltip = newValue;
    this.iconPath = new vscode.ThemeIcon('notebook-state-success');
    if(flagList[this.action].length > 0){
      const indexToRemove = createFVEnvFlags.indexOf(this.flag + " " + this._value);
      if (indexToRemove !== -1) {
        flagList[this.action].splice(indexToRemove, 1);
        if(this.isOptinal === false){
            canIDoStuff[this.action]++;
        }
      }
    } 
    flagList[this.action].push(this.flag + " " + this._value);
    if(this.isOptinal === false){
      canIDoStuff[this.action]--;
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
  
    constructor(label: string, value: string, help: string, flag: string, command?: vscode.Command, action?: Action, isOptinal?: boolean) {
      super(label, vscode.TreeItemCollapsibleState.None, command, action, isOptinal);
      this._value = value;
      this.flag = flag;
      this.isWritten = false;
      this.iconPath = new vscode.ThemeIcon('edit');
      this.description = '...';
      this.help = help;
      if(this.isOptinal){
        this.help += " (OPTINAL)"; 
      }
      this.tooltip = this.help;
    }

    get value(): string {
    /** Function when calling to: <> = item.value; */
      return this._value;
    }

    set value(newValue: string) {
    /** Function when calling to: item.value = <>; 
       Algo: 1. Check if we already have en existing value. If NOT: 
                a. Update the flag counter according to the action and optional value. 
                b. Update the icon to 'V'.
                c. Update that the value was written.
              else: 
                a. Search for the current flag at the flag array and remove it.  
             2. Update the value of the class to the new value.
             3. Check if the new value is an empty string. If so:
                a. Update the icon to its default state (pencil).
                b. Update the counter according to the action and optional value.
                c. Update the fact that the value isn't written.
                d. Update the tooltip.
                e. Update the description.
              else: 
                a. Update the flag array according to the action value.
                b. Update the tooltip.
                c. Update the description.
    */
        if(!this.isWritten){ 
          if(this.isOptinal === false){
            canIDoStuff[this.action]--;
          }
          this.isWritten = true;
          this.iconPath = new vscode.ThemeIcon('notebook-state-success');
        }
        else{
            if(flagList[this.action].length > 0){
                const indexToRemove = flagList[this.action].indexOf(this.flag + " " + this._value);
                if (indexToRemove !== -1) {
                  flagList[this.action].splice(indexToRemove, 1);
                }
            }
        }
        this._value = newValue;
        if(newValue === ''){ // turn off
          this.iconPath = new vscode.ThemeIcon('edit');
            this.tooltip = this.help;
            if(this.isOptinal === false){
              canIDoStuff[this.action]++;
            }
            this.isWritten = false;
            this.description = '...';
        }
        else {
            this.tooltip = newValue;
            this.description = newValue;
            flagList[this.action].push(this.flag + " " + newValue);
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
    if(this.value){
      this.tooltip = 'Remove';
      this.iconPath = new vscode.ThemeIcon('notebook-state-success');
      if(this.isSmcverFlag){
        smcverFlags.push(this.initFlag);
      }
      else {
        compFlags.push(this.initFlag);
      }
    }
    else {
      this.tooltip = 'Add';
      this.iconPath = new vscode.ThemeIcon('error-small');
    }
  }

  /** Function when choosing/unchoosing flags.
     Algo: 1. Change the value to !value.
           2. Check if the value is true. If so:
              a. Change its icon to 'V'.
              b. Add the flag to the correct flag array according to the variable: isSmcverFlag.
              c. Change the tooltip to: Remove.
            else:
              a. Change its icon to 'X'.
              b. Remove the flag from the correct flag array according to the variable: isSmcverFlag.
              c. Change the tooltip to: Add.
  */
    updateCheckboxState(): void {
      this.value = !this.value;
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
      this.iconPath = new vscode.ThemeIcon('error-small');
      }
  }
}

export class CEXTreeItem extends MyTreeItem {
  public counterExample: string;
  constructor(public readonly label: string, counterExample: string, command: vscode.Command) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.tooltip = label;
    this.counterExample = counterExample;
    this.contextValue = 'fileItem';
    this.command = {
      command: command.command,
      title: command.title,
      arguments: [this]
    };
  }
}
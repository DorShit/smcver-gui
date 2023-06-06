import * as vscode from 'vscode';
import { SMCScript } from './scripts/demoScript';

const smScript = new SMCScript();

export class CustomTreeDataProvider implements vscode.TreeDataProvider<TreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<TreeItem | undefined | null | void> = new vscode.EventEmitter<TreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<TreeItem | undefined | null | void> = this._onDidChangeTreeData.event;


    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(element?: TreeItem | undefined): vscode.ProviderResult<TreeItem[]> {
        return vscode.window.withProgress({ location: { viewId: "customView" } }, () => {
            return new Promise<TreeItem[]>((resolve) => {
            });
        });
    }

    public register(context: vscode.ExtensionContext): any {
        // setup
        const options = {
            treeDataProvider: this,
            showCollapseAll: true
        };

        // build
        vscode.window.registerTreeDataProvider('customView', this);
        vscode.commands.registerCommand('Update-TreeView', () => {
            this.refresh();
        });

        // create
        const tree = vscode.window.createTreeView('customView', options);
        
        // setup: events
        tree.onDidChangeSelection(e => {
            smScript.smcScript(); // breakpoint here for debug
        });
        tree.onDidCollapseElement(e => {
            console.log("2"); // breakpoint here for debug
        });
        tree.onDidChangeVisibility(e => {
            console.log("3"); // breakpoint here for debug
        });
        tree.onDidExpandElement(e => {
            console.log("4"); // breakpoint here for debug
        });

        // subscribe
        context.subscriptions.push(tree);
    }
}

class TreeItem extends vscode.TreeItem {
    children: TreeItem[] | undefined;
    command?: vscode.Command | undefined;

    constructor(
        label: string,
        iconPath?: string | vscode.Uri | { light: string | vscode.Uri; dark: string | vscode.Uri } | vscode.ThemeIcon,
        children?: TreeItem[] | undefined,
        command?: vscode.Command) {

        super(
            label,
            children === undefined
                ? vscode.TreeItemCollapsibleState.None
                : vscode.TreeItemCollapsibleState.Collapsed);
        this.command = command;
        this.iconPath = iconPath;
        this.children = children;
    }
}
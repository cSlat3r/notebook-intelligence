// Copyright (c) Mehmet Bektas <mbektasgh@outlook.com>

import { JupyterFrontEnd } from '@jupyterlab/application';
import { CodeCell } from '@jupyterlab/cells';
import { NotebookPanel } from '@jupyterlab/notebook';
import { CommandRegistry } from '@lumino/commands';
import { IDisposable } from '@lumino/disposable';
import { CellOutputActionFlag, NBIAPI } from './api';
import { cellOutputHasError } from './utils';

interface IToolbarAction {
  id: string;
  label: string;
  title: string;
  iconSvg: string;
  command: string;
  /** Hide the button when this feature flag is disabled. */
  featureFlag: CellOutputActionFlag;
  /** Only show when the cell has at least one error output. */
  requireError?: boolean;
}

const TOOLBAR_CLASS = 'nbi-cell-output-toolbar';
const BUTTON_CLASS = 'nbi-cell-output-toolbar-button';

// Icons are from Microsoft's vscode-codicons set (sparkle, comment-discussion,
// bug), licensed CC BY 4.0. Source: https://github.com/microsoft/vscode-codicons
// Inline SVGs use `currentColor` so the icons follow theme foreground.
const SPARKLES_ICON =
  '<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor" aria-hidden="true"><path d="M5.46524 9.82962C5.62134 9.94037 5.80806 9.99974 5.99946 9.99948C6.19151 10.0003 6.37897 9.94082 6.53546 9.82948C6.69223 9.71378 6.81095 9.55398 6.87646 9.37048L7.22346 8.30348C7.3077 8.05191 7.44906 7.82327 7.63646 7.63548C7.82305 7.44851 8.05078 7.30776 8.30146 7.22448L9.38746 6.87148C9.56665 6.80759 9.72173 6.68989 9.83146 6.53448C9.94145 6.37908 10.0005 6.19337 10.0005 6.00298C10.0005 5.81259 9.94145 5.62689 9.83146 5.47148C9.71293 5.30613 9.54426 5.18339 9.35046 5.12148L8.28146 4.77548C8.02989 4.69238 7.80123 4.55163 7.61371 4.36447C7.4262 4.1773 7.28503 3.9489 7.20146 3.69748L6.84846 2.61348C6.78519 2.43423 6.66777 2.27908 6.51246 2.16948C6.35557 2.06133 6.16951 2.00342 5.97896 2.00342C5.78841 2.00342 5.60235 2.06133 5.44546 2.16948C5.28572 2.28196 5.16594 2.44237 5.10346 2.62748L4.74846 3.71748C4.66476 3.96155 4.52691 4.18351 4.34524 4.36673C4.16358 4.54996 3.9428 4.6897 3.69946 4.77548L2.61546 5.12648C2.43437 5.19048 2.27775 5.30937 2.16743 5.4666C2.05712 5.62383 1.99859 5.81155 2.00003 6.00361C2.00146 6.19568 2.06277 6.38251 2.17541 6.53808C2.28806 6.69364 2.44643 6.81019 2.62846 6.87148L3.69546 7.21848C3.94767 7.30297 4.17673 7.44506 4.36446 7.63348C4.41519 7.6837 4.46262 7.73715 4.50646 7.79348C4.62481 7.94615 4.71614 8.11797 4.77646 8.30148L5.12846 9.38148C5.19143 9.56222 5.30914 9.71886 5.46524 9.82962ZM4.00746 6.26448L3.15246 5.99948L4.01646 5.71848C4.41071 5.58184 4.76826 5.35637 5.06146 5.05948C5.35281 4.76039 5.57294 4.39943 5.70546 4.00348L5.97046 3.14448L6.25046 4.00648C6.38349 4.40638 6.60809 4.76969 6.90636 5.06744C7.20463 5.36519 7.56833 5.58915 7.96846 5.72148L8.84846 5.99048L7.98746 6.27048C7.58707 6.40272 7.22321 6.62691 6.92505 6.92507C6.62689 7.22324 6.4027 7.58709 6.27046 7.98748L6.00546 8.84448L5.72646 7.98548C5.63026 7.69329 5.48483 7.41968 5.29646 7.17648C5.22699 7.08766 5.15254 7.00286 5.07346 6.92248C4.7738 6.62366 4.4089 6.39842 4.00746 6.26448ZM10.5344 13.8515C10.6703 13.9477 10.8328 13.9994 10.9994 13.9995C11.1642 13.998 11.3245 13.9456 11.4584 13.8495C11.5979 13.751 11.7029 13.611 11.7584 13.4495L12.0064 12.6875C12.0595 12.529 12.1485 12.385 12.2664 12.2665C12.3837 12.148 12.5277 12.0592 12.6864 12.0075L13.4584 11.7555C13.6161 11.701 13.7528 11.5985 13.8494 11.4625C13.9227 11.3595 13.9706 11.2405 13.9891 11.1154C14.0076 10.9903 13.9962 10.8626 13.9558 10.7428C13.9154 10.623 13.8472 10.5144 13.7567 10.4261C13.6662 10.3377 13.5561 10.272 13.4354 10.2345L12.6714 9.98548C12.5132 9.93291 12.3695 9.8443 12.2514 9.72663C12.1334 9.60896 12.0444 9.46547 11.9914 9.30748L11.7394 8.53348C11.685 8.37623 11.5825 8.24011 11.4464 8.14448C11.3443 8.07153 11.2266 8.02359 11.1026 8.00453C10.9787 7.98547 10.8519 7.99582 10.7327 8.03475C10.6135 8.07369 10.5051 8.1401 10.4163 8.22865C10.3274 8.31719 10.2607 8.42538 10.2214 8.54448L9.97435 9.30648C9.92207 9.46413 9.83452 9.60777 9.71835 9.72648C9.60382 9.84272 9.46428 9.9313 9.31035 9.98548L8.53435 10.2385C8.41689 10.2793 8.31057 10.347 8.22382 10.4361C8.13708 10.5252 8.0723 10.6333 8.03464 10.7518C7.99698 10.8704 7.98746 10.996 8.00686 11.1189C8.02625 11.2417 8.07401 11.3583 8.14635 11.4595C8.24456 11.5993 8.38462 11.7044 8.54635 11.7595L9.30935 12.0065C9.46821 12.0599 9.61262 12.1492 9.73135 12.2675C9.84958 12.3857 9.93801 12.5304 9.98935 12.6895L10.2424 13.4635C10.2971 13.6199 10.3992 13.7555 10.5344 13.8515ZM9.62035 11.0585L9.44235 10.9995L9.62635 10.9355C9.92811 10.8305 10.2018 10.6578 10.4264 10.4305C10.6528 10.2015 10.8238 9.92374 10.9264 9.61848L10.9844 9.44048L11.0434 9.62148C11.1453 9.92819 11.3175 10.2069 11.5461 10.4353C11.7748 10.6638 12.0536 10.8357 12.3604 10.9375L12.5554 11.0005L12.3754 11.0595C12.068 11.1617 11.7888 11.3344 11.5601 11.5637C11.3314 11.7931 11.1596 12.0728 11.0584 12.3805L10.9994 12.5615L10.9414 12.3805C10.84 12.0721 10.6676 11.7919 10.4382 11.5623C10.2088 11.3326 9.92863 11.1601 9.62035 11.0585Z"/></svg>';
const CHAT_ICON =
  '<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor" aria-hidden="true"><path d="M14.56 7.44049C14.28 7.16049 13.9 7.00049 13.5 7.00049H13V4.00049C13 2.90049 12.1 2.00049 11 2.00049H3C1.9 2.00049 1 2.90049 1 4.00049V9.00049C1 10.1005 1.9 11.0005 3 11.0005V12.0005C3 12.8205 3.93 13.2905 4.59 12.8105L7 11.0505V11.5005C7 11.9005 7.16 12.2805 7.44 12.5605C7.72 12.8405 8.1 13.0005 8.5 13.0005H10.29L12.15 14.8505C12.19 14.9005 12.25 14.9405 12.31 14.9605C12.37 14.9905 12.43 15.0005 12.5 15.0005C12.57 15.0005 12.63 14.9905 12.69 14.9605C12.78 14.9205 12.86 14.8605 12.92 14.7805C12.97 14.7005 13 14.6005 13 14.5005V13.0005H13.5C13.9 13.0005 14.28 12.8405 14.56 12.5605C14.84 12.2805 15 11.9005 15 11.5005V8.50049C15 8.10049 14.84 7.72049 14.56 7.44049ZM6.75 10.0005L4 12.0005V10.0005H3C2.45 10.0005 2 9.55049 2 9.00049V4.00049C2 3.45049 2.45 3.00049 3 3.00049H11C11.55 3.00049 12 3.45049 12 4.00049V7.00049H8.5C8.1 7.00049 7.72 7.16049 7.44 7.44049C7.16 7.72049 7 8.10049 7 8.50049V10.0005H6.75ZM14 11.5005C14 11.6305 13.95 11.7605 13.85 11.8505C13.76 11.9505 13.63 12.0005 13.5 12.0005H12.5C12.37 12.0005 12.24 12.0505 12.15 12.1505C12.05 12.2405 12 12.3705 12 12.5005V13.2905L10.85 12.1505C10.81 12.1005 10.75 12.0605 10.69 12.0405C10.63 12.0105 10.57 12.0005 10.5 12.0005H8.5C8.37 12.0005 8.24 11.9505 8.15 11.8505C8.05 11.7605 8 11.6305 8 11.5005V8.50049C8 8.37049 8.05 8.24049 8.15 8.15049C8.24 8.05049 8.37 8.00049 8.5 8.00049H13.5C13.63 8.00049 13.76 8.05049 13.85 8.15049C13.95 8.24049 14 8.37049 14 8.50049V11.5005Z"/></svg>';
const BUG_ICON =
  '<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor" aria-hidden="true"><path d="M14.5 8H13V6C13 5.63 12.898 5.283 12.722 4.985L13.853 3.854C14.048 3.659 14.048 3.342 13.853 3.147C13.658 2.952 13.341 2.952 13.146 3.147L12.015 4.278C11.717 4.102 11.37 4 11 4C11 2.346 9.654 1 8 1C6.346 1 5 2.346 5 4C4.63 4 4.283 4.102 3.985 4.278L2.854 3.147C2.659 2.952 2.342 2.952 2.147 3.147C1.952 3.342 1.952 3.659 2.147 3.854L3.278 4.985C3.102 5.283 3 5.63 3 6V8H1.5C1.224 8 1 8.224 1 8.5C1 8.776 1.224 9 1.5 9H3C3 10.199 3.424 11.3 4.13 12.163L2.396 13.897C2.201 14.092 2.201 14.409 2.396 14.604C2.494 14.702 2.622 14.75 2.75 14.75C2.878 14.75 3.006 14.701 3.104 14.604L4.838 12.87C5.7 13.576 6.802 14 8.001 14C9.2 14 10.301 13.576 11.164 12.87L12.898 14.604C12.996 14.702 13.124 14.75 13.252 14.75C13.38 14.75 13.508 14.701 13.606 14.604C13.801 14.409 13.801 14.092 13.606 13.897L11.872 12.163C12.578 11.301 13.002 10.199 13.002 9H14.502C14.778 9 15.002 8.776 15.002 8.5C15.002 8.224 14.778 8 14.502 8H14.5ZM8 2C9.103 2 10 2.897 10 4H6C6 2.897 6.897 2 8 2ZM12 9C12 11.206 10.206 13 8 13C5.794 13 4 11.206 4 9V6C4 5.449 4.448 5 5 5H11C11.552 5 12 5.449 12 6V9Z"/></svg>';

const ACTIONS: IToolbarAction[] = [
  {
    id: 'explain',
    label: 'Explain',
    title: "Explain this cell's output",
    iconSvg: SPARKLES_ICON,
    command: 'notebook-intelligence:editor-explain-this-output',
    featureFlag: 'output_followup'
  },
  {
    id: 'ask',
    label: 'Ask',
    title: 'Ask about this output',
    iconSvg: CHAT_ICON,
    command: 'notebook-intelligence:editor-ask-about-this-output',
    featureFlag: 'output_followup'
  },
  {
    id: 'troubleshoot',
    label: 'Troubleshoot',
    title: 'Troubleshoot the error in this cell',
    iconSvg: BUG_ICON,
    command: 'notebook-intelligence:editor-troubleshoot-this-output',
    featureFlag: 'explain_error',
    requireError: true
  }
];

/**
 * Show a hover toolbar over Jupyter cell outputs that surfaces the existing
 * Explain / Ask / Troubleshoot commands as one-click buttons.
 *
 * The toolbar respects the `output_toolbar` feature flag (whole-toolbar
 * gate) and the per-action `explain_error` / `output_followup` flags so a
 * locked-off feature stays locked off here too.
 */
export class CellOutputHoverToolbar implements IDisposable {
  private _app: JupyterFrontEnd;
  private _commands: CommandRegistry;
  private _disposed = false;
  private _activeArea: HTMLElement | null = null;
  private _onMouseOver: (event: MouseEvent) => void;
  private _onMouseLeave: () => void;

  constructor(app: JupyterFrontEnd, commands: CommandRegistry) {
    this._app = app;
    // The Explain / Ask / Troubleshoot commands live on the context-menu's
    // private CommandRegistry, not on `app.commands`, so callers must pass
    // the same registry the menu uses.
    this._commands = commands;
    this._onMouseOver = this._handleMouseOver.bind(this);
    // mouseleave only fires when the cursor exits the area entirely —
    // descendants (including the toolbar itself) don't trigger it.
    this._onMouseLeave = this._removeActiveToolbar.bind(this);
    document.body.addEventListener('mouseover', this._onMouseOver);
  }

  get isDisposed(): boolean {
    return this._disposed;
  }

  dispose(): void {
    if (this._disposed) {
      return;
    }
    this._disposed = true;
    document.body.removeEventListener('mouseover', this._onMouseOver);
    this._removeActiveToolbar();
  }

  private _handleMouseOver(event: MouseEvent): void {
    if (!NBIAPI.config.cellOutputFeatures.output_toolbar.enabled) {
      this._removeActiveToolbar();
      return;
    }
    const target = event.target as HTMLElement | null;
    if (!target) {
      return;
    }
    const area = target.closest<HTMLElement>('.jp-Cell-outputArea');
    if (!area) {
      return;
    }
    if (area === this._activeArea) {
      return;
    }
    this._removeActiveToolbar();
    const cellEl = area.closest<HTMLElement>('.jp-Cell');
    if (!cellEl) {
      return;
    }
    const located = this._locateCell(cellEl);
    if (!located) {
      return;
    }
    const toolbar = this._buildToolbar(
      located.panel,
      located.cellIndex,
      located.cell
    );
    if (!toolbar) {
      return;
    }
    area.appendChild(toolbar);
    this._activeArea = area;
    area.addEventListener('mouseleave', this._onMouseLeave);
  }

  private _removeActiveToolbar(): void {
    if (!this._activeArea) {
      return;
    }
    this._activeArea.removeEventListener('mouseleave', this._onMouseLeave);
    const existing = this._activeArea.querySelector(`.${TOOLBAR_CLASS}`);
    if (existing) {
      existing.remove();
    }
    this._activeArea = null;
  }

  private _locateCell(
    cellEl: HTMLElement
  ): { panel: NotebookPanel; cell: CodeCell; cellIndex: number } | null {
    const widget = this._app.shell.currentWidget;
    if (!(widget instanceof NotebookPanel)) {
      return null;
    }
    const widgets = widget.content.widgets;
    for (let i = 0; i < widgets.length; i++) {
      const cell = widgets[i];
      if (cell.node === cellEl && cell instanceof CodeCell) {
        return { panel: widget, cell, cellIndex: i };
      }
    }
    return null;
  }

  private _buildToolbar(
    panel: NotebookPanel,
    cellIndex: number,
    cell: CodeCell
  ): HTMLElement | null {
    const features = NBIAPI.config.cellOutputFeatures;
    const hasError = cellOutputHasError(cell);

    const visible = ACTIONS.filter(a => {
      if (!features[a.featureFlag].enabled) {
        return false;
      }
      if (a.requireError && !hasError) {
        return false;
      }
      return true;
    });
    if (visible.length === 0) {
      return null;
    }

    const toolbar = document.createElement('div');
    toolbar.className = TOOLBAR_CLASS;
    toolbar.setAttribute('role', 'toolbar');
    toolbar.setAttribute('aria-label', 'Notebook Intelligence cell actions');

    for (const action of visible) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = BUTTON_CLASS;
      button.title = action.title;
      button.setAttribute('aria-label', action.title);
      button.innerHTML = `${action.iconSvg}<span class="${BUTTON_CLASS}-label">${action.label}</span>`;
      button.addEventListener('click', event => {
        event.stopPropagation();
        // The editor commands act on the active cell, so activate the
        // hovered one first.
        panel.content.activeCellIndex = cellIndex;
        void this._commands.execute(action.command);
      });
      toolbar.appendChild(button);
    }
    return toolbar;
  }
}

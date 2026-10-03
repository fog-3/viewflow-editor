import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ThemeToggle } from '../../shared/theme-toggle/theme-toggle';
import { ExportMenu } from '../../component/workspace/export-menu/export-menu';
import { ImportMenu } from '../../component/workspace/import-menu/import-menu';
import { PropertiesPanel } from '../../component/workspace/properties-panel/properties-panel';
import { UndoRedoControls } from '../../component/workspace/undo-redo-controls/undo-redo-controls';
import { WorkspaceCanvas } from '../../component/workspace/workspace-canvas/workspace-canvas';
import { WorkspaceSidebar } from '../../component/workspace/workspace-sidebar/workspace-sidebar';
import { WorkspaceUiService } from '../../services/workspace-ui.service';
import { WorkspaceStateService } from '../../services/WorkspaceState.service';

@Component({
  selector: 'app-workspace-page',
  imports: [RouterLink, ThemeToggle, ExportMenu, ImportMenu, PropertiesPanel, UndoRedoControls, WorkspaceCanvas, WorkspaceSidebar],
  templateUrl: './workspace-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class WorkspacePage {
  readonly workspaceUiService = inject(WorkspaceUiService);
  readonly workspaceStateService = inject(WorkspaceStateService);
  isEditingTitle = false;
  titleDraft = '';

  startTitleEdit(): void {
    this.titleDraft = this.workspaceStateService.workspaceTitle();
    this.isEditingTitle = true;
  }

  updateTitleDraft(event: Event): void {
    this.titleDraft = (event.target as HTMLInputElement).value;
  }

  saveTitle(): void {
    if (!this.isEditingTitle) return;
    this.workspaceStateService.setWorkspaceTitle(this.titleDraft);
    this.isEditingTitle = false;
  }

  cancelTitleEdit(): void {
    this.isEditingTitle = false;
  }
}

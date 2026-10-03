import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { WorkspaceFacadeService } from '../../../services/workspace-facade.service';
import { WorkspaceUiService } from '../../../services/workspace-ui.service';

@Component({
  selector: 'app-undo-redo-controls',
  imports: [],
  templateUrl: './undo-redo-controls.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UndoRedoControls {
  private readonly workspaceFacadeService = inject(WorkspaceFacadeService);
  readonly workspaceUiService = inject(WorkspaceUiService);

  readonly canUndo = this.workspaceFacadeService.canUndo;
  readonly canRedo = this.workspaceFacadeService.canRedo;

  clearCanvas(): void {
    this.workspaceFacadeService.clearWorkspace();
  }

  undo(): void {
    this.workspaceFacadeService.undo();
  }

  redo(): void {
    this.workspaceFacadeService.redo();
  }

  toggleGrid(): void {
    this.workspaceUiService.toggleGrid();
  }
}
  
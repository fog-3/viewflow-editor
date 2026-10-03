import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { WorkspaceGraphService } from '../../../services/workspace-graph.service';
import { WorkspaceStateService } from '../../../services/WorkspaceState.service';

@Component({
  selector: 'app-export-menu',
  imports: [],
  templateUrl: './export-menu.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExportMenu {
  private readonly workspaceGraphService = inject(WorkspaceGraphService);
  private readonly workspaceStateService = inject(WorkspaceStateService);

  exportJson(): void {
    const content = JSON.stringify(this.workspaceGraphService.exportJson(), null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    this.download(blob, `${this.getSafeTitle()}.json`);
  }

  exportPng(): void {
    this.workspaceGraphService.exportPng(`${this.getSafeTitle()}.png`);
  }

  private getSafeTitle(): string {
    return this.workspaceStateService.workspaceTitle()
      .trim()
      .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-')
      .replace(/[. ]+$/g, '') || 'Untitled flow';
  }

  private download(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  }
}

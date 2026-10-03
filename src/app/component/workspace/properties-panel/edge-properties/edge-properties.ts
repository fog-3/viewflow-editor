import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { EdgeMarker, WorkspaceEdge } from '../../../../models';
import { WorkspaceFacadeService } from '../../../../services/workspace-facade.service';

@Component({
  selector: 'edge-properties',
  imports: [],
  templateUrl: './edge-properties.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EdgeProperties {
  readonly workspaceFacadeService = inject(WorkspaceFacadeService);
  edgeSelected = input.required<WorkspaceEdge>();
  readonly markerOptions: Array<{ value: EdgeMarker | ''; label: string }> = [
    { value: '', label: '— None' },
    { value: 'block', label: '▸ Block' },
    { value: 'classic', label: '∨ Classic' },
    { value: 'cross', label: '× Cross' },
    { value: 'circle', label: '○ Circle' },
    { value: 'circlePlus', label: '⊕ Circle plus' },
    { value: 'diamond', label: '◇ Diamond' },
  ];

  updateLabel(value: string): void {
    this.updateEdge({ label: value });
  }

  updateColor(value: string): void {
    this.updateEdge({ color: value });
  }

  updateTextColor(value: string): void {
    this.updateEdge({ textColor: value });
  }

  updateFontSize(value: string): void {
    const parsedValue = Number(value);
    if (!Number.isFinite(parsedValue)) return;

    this.updateEdge({ fontSize: Math.max(1, parsedValue) });
  }

  updateSourceMarker(value: string): void {
    this.updateEdge({
      sourceMarker: value === 'none' ? undefined : value as EdgeMarker,
    });
}

  updateTargetMarker(value: string): void {
    this.updateEdge({
      targetMarker: value === 'none' ? undefined : value as EdgeMarker,
    });
  }

  updateRadious(value: string): void {
    const parsedValue = Number(value);
    if (value.trim() === '') {
      this.updateEdge({ radious: undefined });
      return;
    }

    if (!Number.isFinite(parsedValue)) return;
    this.updateEdge({ radious: Math.max(0, parsedValue) });
  }

  private updateEdge(changes: Partial<WorkspaceEdge>): void {
    this.workspaceFacadeService.updateEdge({ ...this.edgeSelected(), ...changes });
  }

  getType(value: any): string {
    return typeof value;
  }
}

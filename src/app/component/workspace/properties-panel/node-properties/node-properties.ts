import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { WorkspaceFacadeService } from '../../../../services/workspace-facade.service';
import { ShapeType, WorkspaceNode } from '../../../../models';

@Component({
  selector: 'node-properties',
  imports: [DecimalPipe],
  templateUrl: './node-properties.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NodeProperties {
  readonly workspaceFacadeService = inject(WorkspaceFacadeService);
  nodeSelected = input.required<WorkspaceNode>();

  readonly shapeOptions: Array<{ value: ShapeType; label: string }> = [
    { value: 'rect', label: 'Rectangle' },
    { value: 'circle', label: 'Circle' },
    { value: 'ellipse', label: 'Ellipse' },
    { value: 'polygon', label: 'Diamond' },
  ];

  updateLabel(value: string): void {
    this.updateNode({ label: value, text: value });
  }

  updateTextColor(value: string): void {
    this.updateNode({ textColor: value });
  }

  updateFillColor(value: string): void {
    this.updateNode({ fillColor: value });
  }

  updateBorderColor(value: string): void {
    this.updateNode({ borderColor: value });
  }

  updateShape(value: string): void {
    const selectedShape = this.shapeOptions.find(option => option.value === value);
    if (!selectedShape) return;
    
    console.log(selectedShape.value);
    this.updateNode({ shape: selectedShape.value });
  }

  updateNumber(property: 'x' | 'y' | 'width' | 'height' | 'borderRadius' | 'fillOpacity' | 'angle' | 'fontSize', value: string): void {
    if (property === 'borderRadius' && this.borderRadiousNotAllowed()) return;

    const parsedValue = Number(value);
    if (!Number.isFinite(parsedValue)) return;

    const limits: Record<typeof property, { min: number; max?: number }> = {
      x: { min: 0 },
      y: { min: 0 },
      width: { min: 20 },
      height: { min: 20 },
      borderRadius: { min: 0 },
      fillOpacity: { min: 0, max: 1 },
      angle: { min: -360, max: 360 },
      fontSize: { min: 1 },
    };
    const { min, max } = limits[property];
    const boundedValue = Math.max(min, max === undefined ? parsedValue : Math.min(max, parsedValue));

    this.updateNode({ [property]: boundedValue });
  }

  private updateNode(changes: Partial<WorkspaceNode>): void {
    this.workspaceFacadeService.updateNode({ ...this.nodeSelected(), ...changes });
  }

  borderRadiousNotAllowed(): boolean {
    return (this.nodeSelected().shape === 'circle' || this.nodeSelected().shape === 'ellipse'
        || this.nodeSelected().shape === 'polygon' || this.nodeSelected().shape === 'polyline'
        || this.nodeSelected().shape === 'html' || this.nodeSelected().shape === 'path'
    );
  }
}

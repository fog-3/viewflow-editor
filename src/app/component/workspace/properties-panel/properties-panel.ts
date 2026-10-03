import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { WorkspaceGraphService } from '../../../services/workspace-graph.service';
import { WorkspaceFacadeService } from '../../../services/workspace-facade.service';
import { WorkspaceEdge, WorkspaceNode } from '../../../models';
import { NodeProperties } from './node-properties/node-properties';
import { EdgeProperties } from './edge-properties/edge-properties';

@Component({
  selector: 'app-properties-panel',
  imports: [NodeProperties, EdgeProperties],
  templateUrl: './properties-panel.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertiesPanel {
  readonly workspaceFacadeService = inject(WorkspaceFacadeService);
  nodeSelected = input.required<WorkspaceNode | null>();
  edgeSelected = input.required<WorkspaceEdge | null>();
  
  
  closeProperties() {
    this.workspaceFacadeService.selectNode(null);
    this.workspaceFacadeService.selectEdge(null);
  }

  deleteSelectedNode(): void {
    const node = this.nodeSelected();
    if (!node) return;

    this.workspaceFacadeService.removeNode(node.id);
  }

  deleteSelectedEdge(): void {
    const edge = this.edgeSelected();
    if (!edge) return;

    this.workspaceFacadeService.removeEdge(edge.id);
  }
}

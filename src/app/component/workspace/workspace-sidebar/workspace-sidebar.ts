import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { WorkspaceUiService} from '../../../services/workspace-ui.service';
import { WorkspaceEdge, WorkspaceNode, WorkspaceShapeType } from '../../../models';
import { WorkspaceFacadeService } from '../../../services/workspace-facade.service';
import { getInitialTheme } from '../../../shared/utils/util-functions';

export function generateUniqueId(): string {
  return crypto.randomUUID();
}

@Component({
  selector: 'app-workspace-sidebar',
  standalone: true,
  templateUrl: './workspace-sidebar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkspaceSidebar {
  readonly workspaceUiService = inject(WorkspaceUiService);
  readonly workspaceFacadeService = inject(WorkspaceFacadeService);

  selectShape(shape: WorkspaceShapeType): void {
    this.workspaceUiService.selectShape(shape);

    switch (shape) {
      case 'rectangle':
        this.createRectangle();
        break;
      case 'rounded':
        this.createRounded();
        break;
      case 'diamond':
        this.createDiamond();
        break;
      case 'circle':
        this.createCircle();
        break;
    }
  }

  createRectangle(): void {
    const newNode: WorkspaceNode = {
      id: generateUniqueId(),
      label: 'Rectangle',
      shape: 'rect',
      x: 100,
      y: 100,
      width: 100,
      height: 60,
      fillColor: getInitialTheme() === 'dark' ? '#000000': '#ffffff',
      borderColor: '#ff8067',
      borderRadius: 0,
      fillOpacity: 0,
      textColor: getInitialTheme() === 'dark' ? '#ffffff' : '#000000',
      text: '',
      angle: 0
    };
    this.workspaceFacadeService.addNode(newNode);
  }

  createRounded(): void {
    const newNode: WorkspaceNode = {
      id: generateUniqueId(),
      label: 'Rounded',
      shape: 'rect',
      x: 100,
      y: 100,
      width: 100,
      height: 60,
      fillColor: getInitialTheme() === 'dark' ? '#000000': '#ffffff',
      borderColor: '#ff8067',
      borderRadius: 10,
      fillOpacity: 0,
      textColor: getInitialTheme() === 'dark' ? '#ffffff' : '#000000',
      text: '',
      angle: 0
    };
    this.workspaceFacadeService.addNode(newNode);
  }

  createDiamond(): void {
    const newNode: WorkspaceNode = {
      id: generateUniqueId(),
      label: 'Diamond',
      shape: 'polygon',
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      fillColor: getInitialTheme() === 'dark' ? '#000000': '#ffffff',
      borderColor: '#ff8067',
      borderRadius: 0,
      fillOpacity: 0,
      textColor: getInitialTheme() === 'dark' ? '#ffffff' : '#000000',
      text: '',
      points: '100,0 200,100 100,200 0,100',
      angle: 0
    };
    this.workspaceFacadeService.addNode(newNode);
  }

  createCircle(): void {
    const newNode: WorkspaceNode = {
      id: generateUniqueId(),
      label: 'Circle',
      shape: 'circle',
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      fillColor: getInitialTheme() === 'dark' ? '#000000': '#ffffff',
      borderColor: '#ff8067',
      borderRadius: 50,
      fillOpacity: 0,
      textColor: getInitialTheme() === 'dark' ? '#ffffff' : '#000000',
      text: '',
      angle: 0
    };
    this.workspaceFacadeService.addNode(newNode);
  }

  createEdge(): void {
    const newEdge: WorkspaceEdge = {
      id: generateUniqueId(),
      source: { type: 'point', x: 100, y: 140 },
      target: { type: 'point', x: 300, y: 140 },
      color: '#ff8067',
      label: '',
      radious: 0,
      targetMarker: 'classic'
    };

    this.workspaceFacadeService.addEdge(newEdge);
  }
}

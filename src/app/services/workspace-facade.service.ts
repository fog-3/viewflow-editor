import { inject, Injectable } from '@angular/core';
import { WorkspaceGraphService } from './workspace-graph.service';
import { WorkspaceStateService } from './WorkspaceState.service';
import { WorkspaceHistoryService } from './workspace-history.service';
import { WorkspaceEdge, WorkspaceNode, WorkspaceState } from '../models';

@Injectable({
  providedIn: 'root',
})
export class WorkspaceFacadeService {
  private readonly workspaceHistoryService = inject(WorkspaceHistoryService);

  readonly canUndo = this.workspaceHistoryService.canUndo;
  readonly canRedo = this.workspaceHistoryService.canRedo;

  constructor(
    private readonly workspaceStateService: WorkspaceStateService,
    private readonly workspaceGraphService: WorkspaceGraphService,
  ) {}

  /**
   * Añade un nodo al workspace y sincroniza estado + graph.
   */
  addNode(node: WorkspaceNode): void {
    this.workspaceStateService.addNode(node);
    this.workspaceGraphService.addNode(node);
  }

  addEdge(edge: WorkspaceEdge): void {
    this.workspaceStateService.addEdge(edge);
    this.workspaceGraphService.addEdge(edge);
  }

  /**
   * Elimina un nodo del workspace y sincroniza estado + graph.
   */
  removeNode(nodeId: string): void {
    this.workspaceStateService.removeNode(nodeId);
    this.workspaceGraphService.removeNode(nodeId);
  }

  removeEdge(edgeId: string): void {
    this.workspaceStateService.removeEdge(edgeId);
    this.workspaceGraphService.removeEdge(edgeId);
  }

  /**
   * Update Node properties
   */
  updateNode(node: WorkspaceNode): void {
    this.workspaceStateService.updateNode(node);
    this.workspaceGraphService.updateNode(node);
  }


  /**
   * Update Edge properties
   */
  updateEdge(edge: WorkspaceEdge): void {
    this.workspaceStateService.updateEdge(edge);
    this.workspaceGraphService.updateEdge(edge);
  }

  /**
   * Selecciona un nodo en el workspace y sincroniza estado + graph.
   */
  selectNode(nodeId: string | null): void {
    this.workspaceStateService.selectNode(nodeId);
    this.workspaceGraphService.selectNode(nodeId);
  }

  /**
   * Selecciona un nodo en el workspace y sincroniza estado + graph.
   */
  selectEdge(edgeId: string | null): void {
    this.workspaceStateService.selectEdge(edgeId);
    this.workspaceGraphService.selectEdge(edgeId);
  }

  /**
   * Reemplaza todo el workspace por un nuevo estado.
   * Útil para import JSON.
   */
  replaceWorkspace(newState: WorkspaceState): void {
    this.workspaceHistoryService.record(this.workspaceStateService.getState());

    this.workspaceStateService.setState(newState);
    this.workspaceGraphService.syncFromState();
  }

  importGraphJson(data: unknown): void {
    const importedState = this.workspaceGraphService.importJson(data);
    if (!importedState) {
      throw new Error('Invalid X6 workspace file');
    }

    this.workspaceHistoryService.record(this.workspaceStateService.getState());
    this.workspaceStateService.setState(importedState);
  }

  /**
   * Deshace la última acción.
   */
  undo(): void {
    const previousState = this.workspaceHistoryService.popHistorySnapshot();
    if (!previousState) return;

    this.workspaceHistoryService.pushFutureSnapshot(this.workspaceStateService.getState());

    this.restoreDocumentState(previousState);
    this.workspaceGraphService.syncFromState();
  }

  /**
   * Rehace la última acción deshecha.
   */
  redo(): void {
    const nextState = this.workspaceHistoryService.popFutureSnapshot();
    if (!nextState) return;

    this.workspaceHistoryService.pushHistorySnapshot(this.workspaceStateService.getState());

    this.restoreDocumentState(nextState);
    this.workspaceGraphService.syncFromState();
  }

  /**
   * Limpia el workspace completo.
   */
  clearWorkspace(): void {
    this.workspaceStateService.resetWorkspace();
    this.workspaceGraphService.clearGraph();
  }

  private restoreDocumentState(state: WorkspaceState): void {
    const currentViewport = this.workspaceStateService.getState().viewport;

    this.workspaceStateService.setState({
      ...state,
      viewport: currentViewport,
    });
  }
}

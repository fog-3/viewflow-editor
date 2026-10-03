import { Injectable, signal, computed, inject } from '@angular/core';
import { WorkspaceEdge, WorkspaceNode, WorkspaceState, WorkspaceViewport } from '../models';
import { WorkspaceHistoryService } from './workspace-history.service';

@Injectable({
  providedIn: 'root',
})
export class WorkspaceStateService {

    private readonly workspaceHistoryService = inject(WorkspaceHistoryService);

    readonly initialViewport: WorkspaceViewport = {
        x: 0,
        y: 0,
        zoom: 1,
    };
    
    private readonly state = signal<WorkspaceState>(this.workspaceHistoryService.getCurrent() ?? {
        nodes: [],
        edges: [],
        selectedNodeId: null,
        selectedEdgeId: null,
        draggingNodeId: null,
        connectingFromNodeId: null,
        viewport: this.initialViewport,
    });

    readonly workspaceState = this.state.asReadonly();
    readonly workspaceTitle = computed(() => this.workspaceHistoryService.title());

    readonly nodes = computed(() => this.state().nodes);
    readonly edges = computed(() => this.state().edges);
    readonly viewport = computed(() => this.state().viewport);

    readonly selectedNode = computed(() => 
        this.state().nodes.find(node => node.id === this.state().selectedNodeId) ?? null
    );

    readonly selectedEdge = computed(() =>
        this.state().edges.find(edge => edge.id === this.state().selectedEdgeId) ?? null
    );

    getState(): WorkspaceState {
        return this.state();
    }

    setWorkspaceTitle(title: string): void {
        this.workspaceHistoryService.setTitle(title.trim() || 'Untitled flow');
    }

    setState(newState: WorkspaceState) {
        const nextState = structuredClone(newState);
        this.state.set(nextState);
        this.workspaceHistoryService.saveCurrent(nextState);
    }

    setViewport(viewport: Partial<WorkspaceViewport>): void {
        const current = this.state();
        const nextViewport = { ...current.viewport, ...viewport };
        if (current.viewport.x === nextViewport.x
            && current.viewport.y === nextViewport.y
            && current.viewport.zoom === nextViewport.zoom) return;

        const nextState = { ...current, viewport: nextViewport };
        this.state.set(nextState);
        this.workspaceHistoryService.saveCurrent(nextState);
    }

    resetWorkspace(): void {
        this.updateState(() => ({
        nodes: [],
        edges: [],
        selectedNodeId: null,
        selectedEdgeId: null,
        draggingNodeId: null,
        connectingFromNodeId: null,
        viewport: this.initialViewport,
        }));
    }

    isResetViewport() {
        const currentViewport = this.state().viewport;
        return (
        currentViewport.x === this.initialViewport.x &&
        currentViewport.y === this.initialViewport.y &&
        currentViewport.zoom === this.initialViewport.zoom
        ); 
    }

    isSomethingSelected(): boolean {
        return this.state().selectedNodeId !== null || this.state().selectedEdgeId !== null;
    }

    addNode(newNode: WorkspaceNode) {
        this.updateState(current => ({
            ...current,
            nodes: [...current.nodes, newNode],
            selectedNodeId: null,
            selectedEdgeId: null,
        }));
    }

    addEdge(newEdge: WorkspaceEdge): void {
        this.updateState(current => ({
            ...current,
            edges: current.edges.some(edge => edge.id === newEdge.id) ? current.edges : [...current.edges, newEdge],
            selectedNodeId: null,
            selectedEdgeId: newEdge.id,
        }));
        console.log("The edge is added");
    }

    removeEdge(edgeId: string): void {
        this.updateState(current => ({
            ...current,
            edges: current.edges.filter(edge => edge.id !== edgeId),
            selectedEdgeId: current.selectedEdgeId === edgeId ? null : current.selectedEdgeId,
        }));
    }

    removeNode(nodeId: string): void {
        this.updateState(current => ({
            ...current,
            nodes: current.nodes.filter(node => node.id !== nodeId),
            edges: current.edges.filter(
            edge => !this.isLinkedToTheNode(edge, nodeId)
            ),
            selectedNodeId: current.selectedNodeId === nodeId ? null : current.selectedNodeId,
            selectedEdgeId: current.selectedEdgeId === nodeId ? null : current.selectedEdgeId,
        }));
    }

    isLinkedToTheNode(edge: WorkspaceEdge, nodeId: string): boolean {
        const sourceIsNode = edge.source.type === 'port' && edge.source.nodeId === nodeId;
        const targetIsNode = edge.target.type === 'port' && edge.target.nodeId === nodeId;
        return sourceIsNode || targetIsNode;
    }

    selectNode(nodeId: string | null): void {
        this.state.update(current => ({
            ...current,
            selectedNodeId: nodeId,
            selectedEdgeId: null,
        }));
        this.workspaceHistoryService.saveCurrent(this.state());
    }

    selectEdge(edgeId: string | null): void {
        this.state.update(current => ({
            ...current,
            selectedNodeId: null,
            selectedEdgeId: edgeId,
        }));
        this.workspaceHistoryService.saveCurrent(this.state());
    }

    clearSelection() {
        this.state.update(current => ({
            ...current,
            selectedNodeId: null,
            selectedEdgeId: null,
        }));
        this.workspaceHistoryService.saveCurrent(this.state());
    }

    basicUpdateNode(nodeId: string, nodeUpdate: { x: number; y: number; width: number; height: number; angle: number;}) {
        this.updateState(current => ({
            ...current,
            nodes: current.nodes.map(node =>
                node.id === nodeId ? { ...node, x: nodeUpdate.x, y: nodeUpdate.y, width: nodeUpdate.width, height: nodeUpdate.height, angle: nodeUpdate.angle } : node
            )
        }));
    }

    updateNodePosition(nodeId: string, x: number, y: number): void {
        this.updateState(current => ({
            ...current,
            nodes: current.nodes.map(node =>
            node.id === nodeId ? { ...node, x, y } : node
            ),
        }));
    }

    updateNode(node: WorkspaceNode) {
        this.updateState(current => ({
            ...current,
            nodes: current.nodes.map(currentNode => 
                node.id === currentNode.id ? node : currentNode
            )
        }));
    }

    updateEdge(edge: WorkspaceEdge): void {
        this.updateState(current => ({
            ...current,
            edges: current.edges.map(currentEdge =>
            currentEdge.id === edge.id
                ? edge
                : currentEdge
            )
        }));
    }

    private updateState(update: (current: WorkspaceState) => WorkspaceState): void {
        const currentState = this.state();
        const nextState = update(currentState);
        
        if (JSON.stringify(currentState) === JSON.stringify(nextState)) return;
        this.workspaceHistoryService.clearFuture();

        this.workspaceHistoryService.record(currentState);

        this.state.set(nextState);
        this.workspaceHistoryService.saveCurrent(nextState);
    }
}

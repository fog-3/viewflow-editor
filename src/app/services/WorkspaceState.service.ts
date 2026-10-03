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
    
    private readonly zoomStep = 0.1;
    private readonly minZoom = 0.1;
    private readonly maxZoom = 3 ;

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

    setState(newState: WorkspaceState) {
        const nextState = structuredClone(newState);
        this.state.set(nextState);
        this.workspaceHistoryService.saveCurrent(nextState);
    }

    setViewport(viewport: Partial<WorkspaceViewport>): void {
        this.updateState(current => ({
        ...current,
        viewport: {
            ...current.viewport,
            ...viewport,
        },
        }), false);
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

    resetViewport(): void {
        this.updateState(current => ({
        ...current,
        viewport: { ...this.initialViewport },
        }), false);
    }

    centerViewport(containerWidth: number, containerHeight: number): void {
        this.updateState(current => ({
        ...current,
        viewport: {
            ...current.viewport,
            x: containerWidth / 2,
            y: containerHeight / 2,
        },
        }), false);
    }

    zoomIn(mouseX?: number, mouseY?: number): void {
        this.zoomBy(+this.zoomStep, mouseX, mouseY);
    }

    zoomOut(mouseX?: number, mouseY?: number): void {
        this.zoomBy(-this.zoomStep, mouseX, mouseY);
    }

    private zoomBy(delta: number, mouseX?: number, mouseY?: number): void {
        this.updateState(current => {
        const viewport = current.viewport;
        const oldZoom = viewport.zoom;
        const newZoom = this.clamp(oldZoom + delta, this.minZoom, this.maxZoom);

        // Si no hay coordenadas del ratón, solo cambiamos el zoom
        if (mouseX === undefined || mouseY === undefined) {
            return {
            ...current,
            viewport: {
                ...viewport,
                zoom: newZoom,
            },
            };
        }

        const worldX = (mouseX - viewport.x) / oldZoom;
        const worldY = (mouseY - viewport.y) / oldZoom;

        const newX = mouseX - worldX * newZoom;
        const newY = mouseY - worldY * newZoom;

        return {
            ...current,
            viewport: {
            x: newX,
            y: newY,
            zoom: newZoom,
            },
        };
        }, false);
    }

    panViewport(deltaX: number, deltaY: number): void {
        this.updateState(current => {
            const zoom = current.viewport.zoom || 1;

            return {
                ...current,
                viewport: {
                ...current.viewport,
                x: current.viewport.x + deltaX,
                y: current.viewport.y + deltaY,
                },
            }
        }, false);
    }

    private clamp(value: number, min: number, max: number): number {
        return Math.max(min, Math.min(max, value));
    }

    isResetViewport() {
        const currentViewport = this.state().viewport;
        return (
        currentViewport.x === this.initialViewport.x &&
        currentViewport.y === this.initialViewport.y &&
        currentViewport.zoom === this.initialViewport.zoom
        ); 
    }

    resetZoom(): void {
        this.updateState(current => ({
            ...current,
            viewport: {
                ...current.viewport,
                zoom: 1,
            },
        }), false);
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

    private updateState(update: (current: WorkspaceState) => WorkspaceState, recordHistory = true): void {
        const currentState = this.state();
        const nextState = update(currentState);
        
        if (JSON.stringify(currentState) === JSON.stringify(nextState)) return;
        this.workspaceHistoryService.clearFuture();

        if (recordHistory) {
            this.workspaceHistoryService.record(currentState);
        }

        this.state.set(nextState);
        this.workspaceHistoryService.saveCurrent(nextState);
    }
}

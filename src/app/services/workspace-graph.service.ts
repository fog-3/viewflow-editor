import { Injectable, signal } from '@angular/core';
import { Graph, Clipboard, Export, Keyboard, Selection, Transform, NodeProperties, Node, Edge, EdgeProperties } from '@antv/x6';
import { WorkspaceStateService } from './WorkspaceState.service';
import { EdgeEndpoint, getPorts, WorkspaceEdge, WorkspaceNode, WorkspaceState } from '../models';
import {extractColorAndOpacity, getInitialTheme} from '../shared/utils/util-functions';
import { center } from '@antv/x6/lib/registry/node-anchor/bbox';
import { height, width } from '@antv/x6/lib/common/dom/position';
import { opacity } from '@antv/x6/lib/registry/highlighter/opacity';

@Injectable({
  providedIn: 'root',
})
export class WorkspaceGraphService {
  private graph: Graph | null = null;
  private container: HTMLDivElement | null = null;
  private readonly isInitialized = signal(false);
  private isSyncing = false;
  private isSpacePressed = false;
  private isApplyingViewport = false;
  private resizeObserver: ResizeObserver | null = null;

  constructor(private readonly workspaceStateService: WorkspaceStateService) {}

  init(container: HTMLDivElement): void {
    if (this.graph) return;

    this.container = container;

    this.graph = new Graph({
      container,
      grid: false,
      background: {
        color: 'transparent',
      },
      autoResize: true,
      scaling: {
        min: 0.1,
        max: 3,
      },
      panning: false,
      mousewheel: false,
      interacting: {
        nodeMovable: true,
        edgeMovable: true,
        edgeLabelMovable: true,
        vertexMovable: false,
        arrowheadMovable: true,
        magnetConnectable: true,
        stopDelegateOnDragging: true,
        
      },
      connecting: {
        allowBlank: true,
        allowLoop: false,
        snap: true,
        anchor: 'center',
        connectionPoint: 'anchor',
        createEdge() {
          return this.createEdge({
            connector: {
              name: 'rounded',
              args: {
                radius: 0,
              },
            },
            attrs: {
              line: {
                stroke: '#ff8067',
                strokeWidth: 2,
                },
            },
          });
        }
      },
    });

    this.bindViewportEvents();
    this.observeContainerSize(container);
    this.applyViewport(this.workspaceStateService.viewport());
    this.bindGraphEvents();
    this.syncNodesFromState();
    this.graph.use(
      new Clipboard({
        enabled: true,
      }),
    );

    this.graph.use(
      new Selection({
        enabled: true,
        multiple: true,
        rubberband: true,
        movable: true,
        showNodeSelectionBox: true,
        pointerEvents: 'none',
      }),
    );

    this.graph.use(
      new Keyboard({
        enabled: true,
        global: true,
      }),
    );

    this.graph.use(
      new Transform({
        resizing: {
          enabled: true,
        },
        rotating: true,
      }),
    );

    this.graph.use(new Export());

    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && !this.isSpacePressed) {
        this.isSpacePressed = true;
        this.graph?.disableSelection();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space') {
        this.isSpacePressed = false;
        this.graph?.enableSelection();
      }
    });

    this.binTransformEvents();
    this.bindSelectionEvents();
    this.bindKeyboardShortcuts();
    this.isInitialized.set(true);
  }
  
  destroy(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;

    if (this.graph) {
      this.graph.dispose();
      this.graph = null;
    }

    this.container = null;
    this.isInitialized.set(false);
  }

  getGraph(): Graph | null {
    return this.graph;
  }

  panBy(deltaX: number, deltaY: number): void {
    this.graph?.translateBy(deltaX, deltaY);
  }

  zoomAt(zoom: number, x: number, y: number): void {
    this.graph?.zoomTo(zoom, {
      center: { x, y },
      minScale: 0.1,
      maxScale: 3,
    });
  }

  resetZoom(): void {
    this.graph?.zoomTo(1, {
      center: { x: 0, y: 0 },
      minScale: 0.1,
      maxScale: 3,
    });
  }

  resetViewport(): void {
    if (!this.graph) return;
    this.workspaceStateService.setViewport(this.workspaceStateService.initialViewport);
    this.applyViewport(this.workspaceStateService.initialViewport);
  }

  exportPng(fileName = 'viewflow-diagram.png'): void {
    this.graph?.exportPNG(fileName, {
      padding: 24,
      backgroundColor: getInitialTheme() === 'dark' ? '#222c28': '#ebe6db',
    });
  }

  exportJson(): unknown {
    return this.graph?.toJSON() ?? { cells: [] };
  }

  importJson(data: unknown): WorkspaceState | null {
    if (!this.graph || !this.isValidGraphJson(data)) return null;

    this.isSyncing = true;
    try {
      this.graph.fromJSON(data as Parameters<Graph['fromJSON']>[0]);

      const currentState = this.workspaceStateService.getState();
      const nodes: WorkspaceNode[] = [];
      const edges: WorkspaceEdge[] = [];

      for (const cell of this.graph.getCells()) {
        if (cell.isNode()) {
          nodes.push(this.mapX6NodeToWorspace(cell));
        } else if (cell.isEdge()) {
          edges.push(this.mapX6EdgeToStateEdge(cell));
        }
      }

      return {
        ...currentState,
        nodes,
        edges,
        selectedNodeId: null,
        selectedEdgeId: null,
      };
    } finally {
      this.isSyncing = false;
    }
  }

  private isValidGraphJson(data: unknown): boolean {
    if (!data || typeof data !== 'object') return false;

    const cells = (data as { cells?: unknown }).cells;
    return Array.isArray(cells);
  }

  isReady(): boolean {
    return this.isInitialized();
  }

  clearGraph(): void {
    if (!this.graph) return;

    this.isSyncing = true;
    try {
      this.graph.resetCells([]);
      this.applyViewport(this.workspaceStateService.viewport());
    } finally {
      this.isSyncing = false;
    }
  }

  syncNodesFromState(): void {
    this.syncFromState();
  }

  syncFromState(): void {
    if (!this.graph) return;

    this.isSyncing = true;
    try {
      const state = this.workspaceStateService.getState();
      const expectedIds = new Set<string>();

      for (const node of state.nodes) {
        expectedIds.add(node.id);
        const cell = this.graph.getCellById(node.id);

        if (cell?.isNode()) {
          this.updateNodeCell(cell, node);
        } else {
          this.graph.addNode(this.mapWorkspaceNodeToX6(node));
        }
      }

      for (const edge of state.edges) {
        expectedIds.add(edge.id);
        const cell = this.graph.getCellById(edge.id);

        if (cell?.isEdge()) {
          this.updateEdgeCell(cell, edge);
        } else {
          this.graph.addEdge(this.mapWorkspaceEdgeToX6(edge));
        }
      }

      for (const cell of this.graph.getCells()) {
        if (!expectedIds.has(cell.id)) {
          cell.remove();
        }
      }

      this.applyViewport(state.viewport);
      this.restoreSelectionFromState();
    } finally {
      this.isSyncing = false;
    }
  }

  private bindViewportEvents(): void {
    if (!this.graph) return;

    const syncViewport = () => {
      if (this.isApplyingViewport || !this.graph) return;
      const translation = this.graph.translate();
      this.workspaceStateService.setViewport({
        x: translation.tx,
        y: translation.ty,
        zoom: this.graph.zoom(),
      });
    };

    this.graph.on('translate', syncViewport);
    this.graph.on('scale', syncViewport);
  }

  private applyViewport(viewport: { x: number; y: number; zoom: number }): void {
    if (!this.graph) return;

    this.isApplyingViewport = true;
    try {
      this.graph.zoomTo(viewport.zoom, { center: { x: 0, y: 0 } });
      this.graph.translate(viewport.x, viewport.y);
    } finally {
      this.isApplyingViewport = false;
    }
  }

  private observeContainerSize(container: HTMLDivElement): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = new ResizeObserver(([entry]) => {
      if (!this.graph || !entry) return;
      this.graph.resize(entry.contentRect.width, entry.contentRect.height);
    });
    this.resizeObserver.observe(container);
  }

  private restoreSelectionFromState(): void {
    if (!this.graph) return;

    this.graph.cleanSelection();

    const state = this.workspaceStateService.getState();
    const selectedCellId = state.selectedNodeId ?? state.selectedEdgeId;
    if (!selectedCellId) return;

    const selectedCell = this.graph.getCellById(selectedCellId);
    if (selectedCell) {
      this.graph.select(selectedCell);
    }
  }

  addNode(node: WorkspaceNode): void {
    if (!this.graph) return;
    this.graph.addNode(this.mapWorkspaceNodeToX6(node));
  }

  addEdge(edge: WorkspaceEdge): void {
    if (!this.graph) return;

    const newEdge = this.graph.addEdge(this.mapWorkspaceEdgeToX6(edge));
    this.selectGraphCell(newEdge);
  }

  removeNode(nodeId: string): void {
    if (!this.graph) return;

    const cell = this.graph.getCellById(nodeId);
    if (cell) {
      cell.remove();
    }
  }

  removeEdge(edgeId: string): void {
    if (!this.graph) return;

    const cell = this.graph.getCellById(edgeId);
    if (cell?.isEdge()) {
      cell.remove();
    }
  }

  updateNode(node: WorkspaceNode): void {
    if (!this.graph) return;

    const cell = this.graph.getCellById(node.id);
    if (!cell || !cell.isNode()) return;

    this.updateNodeCell(cell, node);
  }

  private updateNodeCell(cell: Node, node: WorkspaceNode): void {

    cell.setProp({
      shape: this.mapShape(node.shape),
      x: node.x,
      y: node.y,
      width: node.width,
      height: node.height,
      points: node.points,
      angle: node.angle,
      attrs: {
        body: {
          fill: this.applyOpacity(node.fillColor, node.fillOpacity),
          stroke: node.borderColor,
          rx: node.borderRadius,
          ry: node.borderRadius,
          strokeWidth: 2,
        },
        label: {
          text: node.label,
          fill: node.textColor,
          fontSize: node.fontSize ?? 14,
          fontFamily: 'Arial, sans-serif',
        },
      },
    });
  }

  updateEdge(edge: WorkspaceEdge): void {
    if (!this.graph) return;

    const cell = this.graph.getCellById(edge.id);
    if (!cell || !cell.isEdge()) return;

    this.updateEdgeCell(cell, edge);
  }

  private updateEdgeCell(cell: Edge, edge: WorkspaceEdge): void {
    cell.setSource(this.mapWorkspaceEndpointToX6(edge.source));
    cell.setTarget(this.mapWorkspaceEndpointToX6(edge.target));

    cell.setProp({
      radious: edge.radious,
      attrs: {
        line: {
          stroke: edge.color,
          strokeWidth: 2,
        },
      },
    });
    cell.setConnector('rounded', { radius: edge.radious ?? 0 });
    cell.setAttrs({
      line: {
        ...(edge.sourceMarker === undefined ? {} : { sourceMarker: edge.sourceMarker }),
        ...(edge.targetMarker === undefined ? {} : { targetMarker: edge.targetMarker }),
      },
    });

    if (edge.sourceMarker === undefined) {
      cell.removeAttrByPath('line/sourceMarker');
    }
    if (edge.targetMarker === undefined) {
      cell.removeAttrByPath('line/targetMarker');
    }
    const labels = cell.getLabels();
    const currentLabelAttrs = labels[0]?.attrs?.['label'];
    const currentLabel = currentLabelAttrs?.['text'];
    const nextLabel = edge.label ?? '';
    const nextTextColor = edge.textColor ?? '#000000';
    const nextFontSize = edge.fontSize ?? 14;

    if (labels[0]) {
      if (currentLabel !== nextLabel
        || currentLabelAttrs?.['fill'] !== nextTextColor
        || currentLabelAttrs?.['fontSize'] !== nextFontSize) {
        cell.setLabels([
          {
            ...labels[0],
            attrs: {
              ...labels[0].attrs,
              label: {
                ...currentLabelAttrs,
                text: nextLabel,
                fill: nextTextColor,
                fontSize: nextFontSize,
              },
            },
          },
          ...labels.slice(1),
        ]);
      }
    } else if (edge.label) {
      cell.setLabels([{ attrs: { label: { text: edge.label, fill: nextTextColor, fontSize: nextFontSize } } }]);
    }
  }

  updatePorts(node: any) {
    const width = node.size().width;
    const height = node.size().height;

    getPorts(this.mapX6NodeToWorspace(node)).forEach(port => {
      node.portProp(port.id, 'args', {
        x: width * port.xPercent / 100,
        y: height * port.yPercent / 100
      });
    });
  }

  private bindGraphEvents(): void {
    if (!this.graph) return;

    this.graph.on('node:moved', ({ node }) => {
      if (this.isSyncing) return;

      const position = node.position();
      this.workspaceStateService.updateNodePosition(node.id, position.x, position.y);
    });

    this.graph.on('cell:removed', ({ cell }) => {
      if (this.isSyncing) return;

      if (cell.isNode()) {
        this.workspaceStateService.removeNode(cell.id);
      } else if (cell.isEdge()) {
        this.workspaceStateService.removeEdge(cell.id);
      }
    });

    this.graph.on('edge:added', ({edge}) => {
      this.syncEdgeToState(edge, true);
    })

    this.graph.on('node:click', ({ e, node }) => {
      if (e.ctrlKey || e.metaKey) {
        this.graph!.select(node, {
          multiple: true,
        });
        this.hidePorts(node);
      } else {
        this.graph!.cleanSelection();
        this.graph!.select(node);
        this.hidePorts(node);
      }
    });

    this.graph.on('edge:click', ({e, edge}) => {
      if (e.ctrlKey || e.metaKey) {
        this.graph!.select(edge, {
          multiple: true,
        });
        this.addToolsToEdge(edge);
      } else {
        this.graph!.cleanSelection();
        this.graph!.select(edge);
      }
    });

    this.graph.on('edge:unselected', ({ edge }) => {
      edge.removeTools();
    });
  }

  private bindSelectionEvents(): void {
    if (!this.graph) return;

    this.graph.on('selection:changed', () => {
      this.syncSelectionToState();
    });

    this.graph.on('node:mouseenter', ({ node }) => {
      if (!this.isSelected(node.id)){
        this.showPorts(node);
      }
    });

    this.graph.on('node:mouseleave', ({ node }) => {
      this.hidePorts(node);
    });
  }

  private binTransformEvents(): void {
    if (!this.graph) return;
    this.graph.on('node:resized', ({ node }) => {
      const position = node.position();
      const size = node.size();

      this.updatePorts(node);
      this.workspaceStateService.basicUpdateNode(node.id, {
        x: position.x,
        y: position.y,
        width: size.width,
        height: size.height,
        angle: node.getAngle()
      });
    });

    this.graph.on('node:rotated', ({ node }) => {
      const position = node.position();
      const size = node.size();

      this.workspaceStateService.basicUpdateNode(node.id, {
        x: position.x,
        y: position.y,
        width: size.width,
        height: size.height,
        angle: node.getAngle(),
      });
    });

    this.graph.on('edge:connected', ({ edge }) => {
      if (this.isSyncing) return;

      this.syncEdgeToState(edge, true);
      this.selectGraphCell(edge);
    });

    this.graph.on('edge:change:source', ({ edge }) => {
      if (this.isSyncing) return;
      this.syncEdgeToState(edge, false);
    });

    this.graph.on('edge:change:target', ({ edge }) => {
      if (this.isSyncing) return;
      this.syncEdgeToState(edge, false);
    });
  }

  private bindKeyboardShortcuts(): void {
    if (!this.graph) return;

    this.graph.bindKey(['delete', 'backspace'], () => {
      const selectedCells = this.graph!.getSelectedCells();
      if (selectedCells.length === 0) return false;

      selectedCells.forEach(cell => cell.remove());
      return false;
    });

    this.graph.bindKey(['ctrl+c', 'cmd+c'], () => {
      const cells = this.graph!.getSelectedCells();

      if (cells.length > 0) {
        this.graph!.copy(cells);
      }

      return false;
    });

    this.graph.bindKey(['ctrl+v', 'cmd+v'], () => {
      if (!this.graph!.isClipboardEmpty()) {
        const pasted = this.graph!.paste({
          offset: 20,
        });
        
        pasted.forEach((cell) => {
          if (cell.isNode()) {
            this.workspaceStateService.addNode(this.mapX6NodeToWorspace(cell));
          } else if (cell.isEdge()) {
            this.workspaceStateService.addEdge(this.mapX6EdgeToStateEdge(cell));
          }
        });

        this.graph!.cleanSelection();
        this.graph!.select(pasted);
      }

      return false;
    });
  }

  private mapWorkspaceNodeToX6(node: WorkspaceNode): any {
    return {
      id: node.id,
      shape: this.mapShape(node.shape),
      x: node.x,
      y: node.y,
      width: node.width,
      height: node.height,
      points: node.points,
      angle: node.angle,
      ports: {
        groups: {
          port: {
            position: 'absolute',
            attrs: {
              circle: {
                r: 3,
                magnet: true,
                stroke: '#ff8067',
                fill: '#fff',
                strokeWidth: 1,
                visibility: 'hidden'
              },
              magnetCircle: {
                r: 4,
                opacity: 0,
                stroke: '#ff8067',
                fill: '#ff8067',
                strokeWidth: 1,
                magnet: true
              }
            }
          }
        },
        items: getPorts(node).map(port => ({
          id: port.id,
          group: 'port',
          args: {
            x: node.width * (port.xPercent / 100),
            y: node.height * (port.yPercent / 100)
          }
        }))
      },
      attrs: {
        body: {
          fill: this.applyOpacity(node.fillColor, node.fillOpacity),
          stroke: node.borderColor,
          rx: node.borderRadius,
          ry: node.borderRadius,
          strokeWidth: 2,
        },
        label: {
          text: node.label,
          fill: node.textColor,
          fontSize: node.fontSize ?? 14,
          fontFamily: 'Arial, sans-serif',
        },
      },
    };
  }

  private mapWorkspaceEdgeToX6(edge: WorkspaceEdge): any {
    return {
      id: edge.id,
      shape: 'edge',
      source: this.mapWorkspaceEndpointToX6(edge.source),
      target: this.mapWorkspaceEndpointToX6(edge.target),
      radious: edge.radious ?? 0,
      connector: {
        name: 'rounded',
        args: {
          radius: edge.radious ?? 0,
        },
      },
      attrs: {
        line: {
          stroke: edge.color,
          strokeWidth: 2,
          targetMarker: edge.targetMarker,
          sourceMarker: edge.sourceMarker,
        },
      },
      labels: edge.label ? [{ attrs: { label: { text: edge.label, fill: edge.textColor ?? '#000000', fontSize: edge.fontSize ?? 14 } } }] : [],
    };
  }

  private mapX6NodeToWorspace(node: any): WorkspaceNode {
    const position = node.position();
    const size = node.size();
    const attrs = node.getAttrs();
    const {fillColor, fillOpacity} = extractColorAndOpacity(attrs.body?.fill);

    return {
      id: node.id,
      shape: node.shape,
      x: position.x,
      y: position.y,
      width: size.width,
      height: size.height,
      points: attrs.body?.refPoints,

      fillColor: fillColor ?? '#ffffff',
      borderColor: attrs.body?.stroke ?? '#000000',
      borderRadius: attrs.body?.rx ?? 0,

      text: attrs.label?.text ?? '',
      label: attrs.label?.text ?? '',
      textColor: attrs.label?.fill ?? '#000000',
      fontSize: attrs.label?.fontSize ?? 14,
      fillOpacity: fillOpacity ?? 1,
      angle: node.store.data.angle ?? 0
    };
  }

  private syncEdgeToState(edge: Edge<EdgeProperties>, createIfMissing: boolean): void {
    const nextEdge = this.mapX6EdgeToStateEdge(edge);
    const edgeExists = this.workspaceStateService.edges().some(currentEdge => currentEdge.id === nextEdge.id);

    if (edgeExists) {
      this.workspaceStateService.updateEdge(nextEdge);
    } else if (createIfMissing) {
      this.workspaceStateService.addEdge(nextEdge);
    }
  }

  hasNonPersistedEdgeChanges(): boolean {
    if (!this.graph) {
      return false;
    }

    return this.graph.getEdges().some(edge => {
      const hasVertices = edge.getVertices().length > 0;

      const labels = edge.getLabels();

      const hasMovedLabel =
        labels.length > 0 &&
        labels.some(label => label.position != null);

      return hasVertices || hasMovedLabel;
    });
  }

  private mapShape(shape: string): string {
    switch (shape) {
      case 'rectangle':
      case 'rounded':
        return 'rect';
      case 'diamond':
      case 'polygon':
        return 'polygon';
      case 'circle':
        return 'ellipse';
      default:
        return 'rect';
    }
  }
  
  mapX6EdgeToStateEdge(edge: Edge<EdgeProperties>): WorkspaceEdge {
    const source = this.mapX6Endpoint(edge.getSource());
    const target = this.mapX6Endpoint(edge.getTarget());

    const labelValue = edge.getLabels()[0]?.attrs?.['label']?.['text'];

    return {
      id: edge.id,
      source,
      target,
      color: edge.attr('line/stroke') ?? '#ff8067',
      label: typeof labelValue === 'string' ? labelValue : '',
      textColor: edge.getLabels()[0]?.attrs?.['label']?.['fill'] as string | undefined,
      fontSize: edge.getLabels()[0]?.attrs?.['label']?.['fontSize'] as number | undefined,
      sourceMarker: edge.attr('line/sourceMarker'),
      targetMarker: edge.attr('line/targetMarker'),
      radious: edge.prop('radious') ?? 0,
    };
  }

  private mapX6Endpoint(endpoint: ReturnType<Edge['getSource']>): EdgeEndpoint {
    if ('cell' in endpoint) {
      return {
        type: 'port',
        nodeId: typeof endpoint.cell === 'string' ? endpoint.cell : endpoint.cell.id,
        portId: endpoint.port ?? '',
      };
    }

    return {
      type: 'point',
      x: endpoint.x,
      y: endpoint.y,
    };
  }

  private mapWorkspaceEndpointToX6(endpoint: EdgeEndpoint): { cell: string; port: string } | { x: number; y: number } {
    if (endpoint.type === 'port') {
      return {
        cell: endpoint.nodeId,
        port: endpoint.portId,
      };
    }

    return {
      x: endpoint.x,
      y: endpoint.y,
    };
  }

  private applyOpacity(hexColor: string, opacity: number): string {
    const alpha = Math.max(0, Math.min(1, opacity));
    const normalized = hexColor.replace('#', '');

    if (normalized.length !== 6) {
      return hexColor;
    }

    const r = parseInt(normalized.slice(0, 2), 16);
    const g = parseInt(normalized.slice(2, 4), 16);
    const b = parseInt(normalized.slice(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  selectNode(nodeId: string | null): void {
    if (!this.graph) return;

    this.graph.cleanSelection();

    if (!nodeId) {
      this.workspaceStateService.clearSelection();
      return;
    }

    const cell = this.graph.getCellById(nodeId);
    if (cell && cell.isNode()) {
      this.graph.select(cell);
      this.workspaceStateService.selectNode(nodeId);
    }
  }

  selectEdge(edgeId: string | null): void {
    if (!this.graph) return;

    this.graph.cleanSelection();

    if (!edgeId) {
      this.workspaceStateService.clearSelection();
      return;
    }

    const cell = this.graph.getCellById(edgeId);
    if (cell && cell.isEdge()) {
      this.graph.select(cell);
      this.workspaceStateService.selectEdge(edgeId);
    }
  }

  clearSelection() {
    if(!this.graph) return;
    this.graph.cleanSelection();
  }

  private syncSelectionToState(): void {
    if (!this.graph || this.isSyncing) return;

    const selectedCells = this.graph.getSelectedCells();

    if (selectedCells.length !== 1) {
      this.workspaceStateService.clearSelection();
      return;
    }

    const selectedCell = selectedCells[0];

    if (selectedCell.isNode()) {
      this.workspaceStateService.selectNode(selectedCell.id);
      return;
    }

    if (selectedCell.isEdge()) {
      this.addToolsToEdge(selectedCell);
      this.workspaceStateService.selectEdge(selectedCell.id);
      return;
    }

    this.workspaceStateService.clearSelection();
  }

  private isSelected(cellId: string): boolean {
    if (!this.graph) return false;
    return this.graph.getSelectedCells().some(cell => cell.id === cellId);
  }

  private selectGraphCell(cell: Node | Edge): void {
    if (!this.graph) return;

    this.isSyncing = true;
    try {
      this.graph.cleanSelection();
      this.graph.select(cell);
    } finally {
      this.isSyncing = false;
    }
  }

  private showPorts(node: Node<NodeProperties>): void {
    node.getPorts().forEach(port => {
      node.setPortProp(
        port.id!,
        'attrs/circle/visibility',
        'visible'
      );
    });
  }

  private hidePorts(node: Node<NodeProperties>): void {
    node.getPorts().forEach(port => {
      node.setPortProp(
        port.id!,
        'attrs/circle/visibility',
        'hidden'
      );
    });
  }

  private addToolsToEdge(edge: Edge<EdgeProperties>) {
    const attributes = {
      fill: '#fff',
      stroke: '#ff8067',
      'stroke-width': 1,
      opacity: 0.7
    }
    

    edge.addTools([
      {
        name: 'source-arrowhead',
        args: {
          attrs: attributes
        }
      },
      {
        name: 'target-arrowhead',
        args: {
          attrs: attributes
        }
      },
      {
        name: 'segments',
        args: {
          attrs: {
            ...attributes,
            width: 16,
            height: 6,
            y: -3
          }
        }
      }
    ]);
  }
}


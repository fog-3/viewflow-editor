import { WorkspaceEdge } from "./workspace-edge.model";
import { WorkspaceNode } from "./workspace-node.model";

export interface WorkspaceState {
  nodes: WorkspaceNode[];
  edges: WorkspaceEdge[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  draggingNodeId: string | null;
  connectingFromNodeId: string | null;
  viewport: WorkspaceViewport;
}

export interface WorkspaceViewport {
  x: number;
  y: number;
  zoom: number;
}

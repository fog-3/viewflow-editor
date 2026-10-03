import { WorkspaceNode } from "./workspace-node.model";

export interface NodePort {
  id: string;
  xPercent: number;
  yPercent: number;
}

export function getPorts(node: WorkspaceNode): NodePort[] {
  switch (node.shape) {
    case 'rect':
      return rectanglePorts;
    case 'circle':
    case 'ellipse':
      return circlePorts;
    case 'polygon':
      return diamondPorts;
    default:
      return genericPorts;
  }
}

export const rectanglePorts = [
    { id: 'top-center', xPercent: 50, yPercent: 0 },
    { id: 'top-left', xPercent: 25, yPercent: 0 },
    { id: 'top-right', xPercent: 75, yPercent: 0 },
    { id: 'left-center', xPercent: 0, yPercent: 50 },
    { id: 'left-top', xPercent: 0, yPercent: 25 },
    { id: 'left-bottom', xPercent: 0, yPercent: 75 },
    { id: 'bottom-center', xPercent: 50, yPercent: 100 },
    { id: 'bottom-left', xPercent: 25, yPercent: 100 },
    { id: 'bottom-right', xPercent: 75, yPercent: 100 },
    { id: 'right-center', xPercent: 100, yPercent: 50 },
    { id: 'right-bottom', xPercent: 100, yPercent: 75 },
    { id: 'right-top', xPercent: 100, yPercent: 25 },
    { id: 'corner-top-left', xPercent: 0, yPercent: 0 },
    { id: 'corner-top-right', xPercent: 100, yPercent: 0 },
    { id: 'corner-bottom-left', xPercent: 0, yPercent: 100 },
    { id: 'corner-bottom-right', xPercent: 100, yPercent: 100 },
];

export const genericPorts = [
    { id: 'top-center', xPercent: 50, yPercent: 0 },
    { id: 'left-center', xPercent: 0, yPercent: 50 },
    { id: 'bottom-center', xPercent: 50, yPercent: 100 },
    { id: 'right-center', xPercent: 100, yPercent: 50 },
    { id: 'corner-top-left', xPercent: 0, yPercent: 0 },
    { id: 'corner-top-right', xPercent: 100, yPercent: 0 },
    { id: 'corner-bottom-left', xPercent: 0, yPercent: 100 },
    { id: 'corner-bottom-right', xPercent: 100, yPercent: 100 },
];

export const circlePorts = [
  { id: 'top', xPercent: 50, yPercent: 0 },
  { id: 'top-right', xPercent: 85, yPercent: 15 },
  { id: 'right', xPercent: 100, yPercent: 50 },
  { id: 'bottom-right', xPercent: 85, yPercent: 85 },
  { id: 'bottom', xPercent: 50, yPercent: 100 },
  { id: 'bottom-left', xPercent: 15, yPercent: 85 },
  { id: 'left', xPercent: 0, yPercent: 50 },
  { id: 'top-left', xPercent: 15, yPercent: 15 },
];

export const diamondPorts = [
  { id: 'top', xPercent: 50, yPercent: 0 },
  { id: 'top-right', xPercent: 75, yPercent: 25 },
  { id: 'right', xPercent: 100, yPercent: 50 },
  { id: 'bottom-right', xPercent: 75, yPercent: 75 },
  { id: 'bottom', xPercent: 50, yPercent: 100 },
  { id: 'bottom-left', xPercent: 25, yPercent: 75 },
  { id: 'left', xPercent: 0, yPercent: 50 },
  { id: 'top-left', xPercent: 25, yPercent: 25 },
];

export type ShapeType = 'rect' | 'circle' | 'ellipse' | 'polygon' | 'polyline' | 'path' | 'image' | 'html';

export interface WorkspaceNode {
    id: string;
    shape: ShapeType;
    label: string;
    x: number;
    y: number;
    width: number;
    height: number;
    fillColor: string;
    borderColor: string;
    borderRadius: number;
    fillOpacity: number;
    textColor: string;
    text: string;
    fontSize?: number;
    angle?: number;
    points?: string;
}


/*
{
  "angle": 0,
  "position": {
    "x": 100,
    "y": 100
  },
  "size": {
    "width": 100,
    "height": 40
  },
  "attrs": {
    "text": {
      "fontSize": 14,
      "fill": "#000000",
      "refX": 0.5,
      "refY": 0.5,
      "textAnchor": "middle",
      "textVerticalAnchor": "middle",
      "fontFamily": "Arial, helvetica, sans-serif",
      "text": "node"
    },
    "rect": {
      "fill": "#ffffff",
      "stroke": "#333333",
      "strokeWidth": 2
    },
    "body": {
      "refWidth": "100%",
      "refHeight": "100%"
    }
  },
  "visible": true,
  "shape": "rect",
  "id": "ab47cadc-4104-457c-971f-50fbb077508a",
  "zIndex": 1
}
*/
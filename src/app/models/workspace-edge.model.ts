export type EdgeEndpoint = { type: 'port'; nodeId: string; portId: string; } | { type: 'point'; x: number; y: number; };
export type EdgeMarker = 'block' | 'classic' | 'cross' | 'circle' | 'circlePlus' | 'diamond';

export interface WorkspaceEdge {
  id: string;
  source: EdgeEndpoint;
  target: EdgeEndpoint;
  color: string;
  label?: string;
  textColor?: string;
  fontSize?: number;
  targetMarker?: EdgeMarker;
  sourceMarker?: EdgeMarker;
  radious?: number;
}


/* {
  "shape": "edge",
  "attrs": {
    "lines": {
      "connection": true,
      "strokeLinejoin": "round"
    },
    "wrap": {
      "strokeWidth": 10
    },
    "line": {
      "stroke": "#333",
      "strokeWidth": 2,
      "targetMarker": "classic"
    }
  },
  "id": "9d5e4f54-1ed3-429e-8d8c-a1526cff2cd8",
  "source": {
    "x": 200,
    "y": 140
  },
  "target": {
    "x": 500,
    "y": 140
  },
  "labels": [{
    "attrs": {
      "label": {
        "text": "edge"
      }
    }
  }],
  "zIndex": 1
} */


/* {
    "shape": "edge",
    "attrs": {
        "lines": {
            "connection": true,
            "strokeLinejoin": "round"
        },
        "wrap": {
            "strokeWidth": 10
        },
        "line": {
            "stroke": "#ff8067",
            "strokeWidth": 2,
            "targetMarker": "classic"
        }
    },
    "id": "a9f0a889-f492-4105-b52d-ef0d27ed4ff6",
    "source": {
        "cell": "1b027857-37ce-4e73-aadf-0a4d099ee445",
        "port": "right-center"
    },
    "target": {
        "x": 200,
        "y": 130
    },
    "zIndex": 2
} */

import { WorkspaceState } from "./workspace-state.model";

export interface WorkspaceStorage {
  current: WorkspaceState;
  history: WorkspaceState[];
  future: WorkspaceState[];
}
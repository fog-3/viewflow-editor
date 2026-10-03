import { Injectable, computed, signal } from '@angular/core';
import { WorkspaceShapeType } from '../models';

@Injectable({
  providedIn: 'root',
})
export class WorkspaceUiService {
  private readonly state = signal({
    sidebarOpen: false,
    selectedShape: null as WorkspaceShapeType | null,
    gridVisible: true,
  });

  readonly sidebarOpen = computed(() => this.state().sidebarOpen);
  readonly selectedShape = computed(() => this.state().selectedShape);
  readonly gridVisible = computed(() => this.state().gridVisible);

  toggleGrid(): void {
    this.state.update(current => ({
      ...current,
      gridVisible: !current.gridVisible,
    }));
  }

  openSidebar(): void {
    this.state.update(current => ({
      ...current,
      sidebarOpen: true,
    }));
  }

  closeSidebar(): void {
    this.state.update(current => ({
      ...current,
      sidebarOpen: false,
      selectedShape: null,
    }));
  }

  toggleSidebar(): void {
    this.state.update(current => ({
      ...current,
      sidebarOpen: !current.sidebarOpen,
    }));
  }

  selectShape(shape: WorkspaceShapeType): void {
    this.state.update(current => ({
      ...current,
      sidebarOpen: true,
      selectedShape: shape,
    }));
  }

  clearSelectedShape(): void {
    this.state.update(current => ({
      ...current,
      selectedShape: null,
    }));
  }

  isSidebarOpen(): boolean {
    return this.state().sidebarOpen;
  }
}

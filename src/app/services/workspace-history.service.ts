import { Injectable, computed, signal } from '@angular/core';
import { WorkspaceState, WorkspaceStorage } from '../models';

@Injectable({
  providedIn: 'root',
})
export class WorkspaceHistoryService {
  private readonly history: WorkspaceState[] = [];
  private readonly future: WorkspaceState[] = [];
  private current: WorkspaceState | null = null;

  private readonly maxSnapshots = 100;
  private readonly storageKey = 'viewflow-workspace';
  private readonly version = signal(0);

  readonly canUndo = computed(() => this.version() >= 0 && this.history.length > 0);
  readonly canRedo = computed(() => this.version() >= 0 && this.future.length > 0);

  constructor() {
    this.restore();
  }

  getCurrent(): WorkspaceState | null {
    return this.current ? structuredClone(this.current) : null;
  }

  saveCurrent(state: WorkspaceState): void {
    this.current = structuredClone(state);
    this.persist();
  }

  record(state: WorkspaceState): void {
    this.history.push(structuredClone(state));

    if (this.history.length > this.maxSnapshots) {
      this.history.shift();
    }

    this.future.length = 0;
    this.changed();
  }

  pushHistorySnapshot(state: WorkspaceState): void {
    this.history.push(structuredClone(state));

    if (this.history.length > this.maxSnapshots) {
      this.history.shift();
    }

    this.changed();
  }

  popHistorySnapshot(): WorkspaceState | null {
    const snapshot = this.history.pop() ?? null;
    this.changed();
    return snapshot;
  }

  pushFutureSnapshot(state: WorkspaceState): void {
    this.future.push(structuredClone(state));
    this.changed();
  }

  popFutureSnapshot(): WorkspaceState | null {
    const snapshot = this.future.pop() ?? null;
    this.changed();
    return snapshot;
  }

  clearFuture(): void {
    this.future.length = 0;
    this.changed();
  }

  private changed(): void {
    this.version.update(version => version + 1);
    this.persist();
  }

  private restore(): void {
    if (typeof localStorage === 'undefined') return;

    try {
      const rawStorage = localStorage.getItem(this.storageKey);
      if (!rawStorage) return;

      const storage = JSON.parse(rawStorage) as Partial<WorkspaceStorage>;
      this.current = storage.current ? structuredClone(storage.current) : null;
      this.history.push(...(storage.history ?? []).map(snapshot => structuredClone(snapshot)));
      this.future.push(...(storage.future ?? []).map(snapshot => structuredClone(snapshot)));
    } catch {
      this.current = null;
      this.history.length = 0;
      this.future.length = 0;
    }
  }

  private persist(): void {
    if (typeof localStorage === 'undefined' || !this.current) return;

    const storage: WorkspaceStorage = {
      current: this.current,
      history: this.history,
      future: this.future,
    };

    localStorage.setItem(this.storageKey, JSON.stringify(storage));
  }
}
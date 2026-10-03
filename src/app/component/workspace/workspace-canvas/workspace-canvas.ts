import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { WorkspaceStateService } from '../../../services/WorkspaceState.service';
import { WorkspaceUiService } from '../../../services/workspace-ui.service';
import { WorkspaceGraphService } from '../../../services/workspace-graph.service';
import { WorkspaceFacadeService } from '../../../services/workspace-facade.service';

@Component({
  selector: 'app-workspace-canvas',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './workspace-canvas.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkspaceCanvas {

  readonly workspaceStateService = inject(WorkspaceStateService);
  readonly workspaceUiService = inject(WorkspaceUiService);
  readonly workspaceGraphService = inject(WorkspaceGraphService);
  readonly workspaceFacadeService = inject(WorkspaceFacadeService);

  @ViewChild('canvasViewport', { static: true })
  canvasViewport!: ElementRef<HTMLElement>;

  @ViewChild('graphContainer', { static: true })
  graphContainer!: ElementRef<HTMLDivElement>;

  isPanning = signal(false);
  spacePressed = signal(false);

  private lastPointerX = 0;
  private lastPointerY = 0;

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;

    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target.isContentEditable
    ) {
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
      event.preventDefault();
      this.workspaceFacadeService.undo();
      return;
    }

    if (event.code === 'Space') {
      event.preventDefault();
      this.spacePressed.set(true);
    }
  }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;

    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target.isContentEditable
    ) {
      return;
    }

    if (event.code === 'Space') {
      event.preventDefault();
      this.spacePressed.set(false);
      this.isPanning.set(false);
    }
  }

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: BeforeUnloadEvent): void {
    if (!this.workspaceGraphService.hasNonPersistedEdgeChanges()) {
      return;
    }

    event.preventDefault();
    event.returnValue = '';
  }

  ngAfterViewInit(): void {
    this.workspaceGraphService.init(
      this.graphContainer.nativeElement
    );
  }

  ngOnDestroy(): void {
    this.workspaceGraphService.destroy();
  }

  onPointerDown(event: PointerEvent): void {
    if (!this.spacePressed() || event.button !== 0) return;

    const viewportEl = this.canvasViewport.nativeElement;
    const rect = viewportEl.getBoundingClientRect();

    // Solo empezar si el click ocurre dentro del viewport visible
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    ) {
      return;
    }

    this.isPanning.set(true);
    this.lastPointerX = event.clientX;
    this.lastPointerY = event.clientY;
  }

  onPointerMove(event: PointerEvent): void {
    if (!this.isPanning()) return;

    const viewportEl = this.canvasViewport.nativeElement;
    const rect = viewportEl.getBoundingClientRect();

    // Si sale del área visible, parar el pan
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    ) {
      this.isPanning.set(false);
      return;
    }

    const deltaX = event.clientX - this.lastPointerX;
    const deltaY = event.clientY - this.lastPointerY;

    this.workspaceStateService.panViewport(deltaX, deltaY);

    this.lastPointerX = event.clientX;
    this.lastPointerY = event.clientY;
  }

  onPointerUp(): void {
    this.isPanning.set(false);
  }

  onWheel(event: WheelEvent): void {
    event.preventDefault();

    const viewportEl = this.canvasViewport.nativeElement;
    const rect = viewportEl.getBoundingClientRect();

    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    if (event.deltaY < 0) {
      this.workspaceStateService.zoomIn(mouseX, mouseY);
    } else {
      this.workspaceStateService.zoomOut(mouseX, mouseY);
    }
  }

  gridBackgroundPosition(): string {
    const { x, y, zoom } = this.workspaceStateService.viewport();
    const baseCellSize = 22;

    const worldX = x / zoom;
    const worldY = y / zoom;

    const offsetX = ((worldX % baseCellSize) + baseCellSize) % baseCellSize * zoom;
    const offsetY = ((worldY % baseCellSize) + baseCellSize) % baseCellSize * zoom;

    return `${offsetX}px ${offsetY}px`;
  }

  gridBackgroundSize(): string {
    const zoom = this.workspaceStateService.viewport().zoom;
    const baseCellSize = 22;
    return `${baseCellSize * zoom}px ${baseCellSize * zoom}px`;
  }

  resetZoom() {
    this.workspaceStateService.resetZoom();
  }

  isResetViewport() {
    return this.workspaceStateService.isResetViewport();
  }
}

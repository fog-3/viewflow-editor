import { ChangeDetectionStrategy, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { WorkspaceFacadeService } from '../../../services/workspace-facade.service';

@Component({
  selector: 'app-import-menu',
  imports: [],
  templateUrl: './import-menu.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportMenu {
  private readonly workspaceFacadeService = inject(WorkspaceFacadeService);

  @ViewChild('fileInput') private fileInput?: ElementRef<HTMLInputElement>;

  openFilePicker(): void {
    this.fileInput?.nativeElement.click();
  }

  importJson(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        this.workspaceFacadeService.importGraphJson(JSON.parse(String(reader.result)) as unknown);
      } catch {
        window.alert('The selected file is not a valid ViewFlow workspace.');
      } finally {
        input.value = '';
      }
    };
    reader.readAsText(file);
  }

}

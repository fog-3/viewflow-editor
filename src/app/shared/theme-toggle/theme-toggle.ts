import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { getInitialTheme } from '../utils/util-functions';

@Component({
  selector: 'app-theme-toggle',
  imports: [],
  templateUrl: './theme-toggle.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeToggle {
  private readonly document = inject(DOCUMENT);
  readonly isDark = signal(getInitialTheme() === 'dark');

  toggle(): void {
    const isDark = !this.isDark();
    this.isDark.set(isDark);
    this.document.documentElement.dataset['theme'] = isDark ? 'dark' : 'light';
    localStorage.setItem('viewflow-theme', isDark ? 'dark' : 'light');
  }
}

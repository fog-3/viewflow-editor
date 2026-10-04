import { DOCUMENT } from '@angular/common';
import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { getInitialTheme } from './shared/utils/util-functions';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('ViewFlow');

  constructor() {
    inject(DOCUMENT).documentElement.dataset['theme'] = getInitialTheme();
  }
}

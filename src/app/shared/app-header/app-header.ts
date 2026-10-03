import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ThemeToggle } from '../theme-toggle/theme-toggle';

@Component({
  selector: 'app-header',
  imports: [RouterLink, ThemeToggle],
  templateUrl: './app-header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})  
export class AppHeader {}

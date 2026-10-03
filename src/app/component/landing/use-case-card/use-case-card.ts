import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-use-case-card',
  imports: [],
  templateUrl: './use-case-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UseCaseCard {
  readonly number = input('01');
  readonly title = input('Map a process');
  readonly description = input('Make the next step easier to see.');
}

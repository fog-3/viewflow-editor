import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UseCaseCard } from '../use-case-card/use-case-card';

@Component({
  selector: 'app-story-scroll-section',
  imports: [UseCaseCard],
  templateUrl: './story-scroll-section.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoryScrollSection {}

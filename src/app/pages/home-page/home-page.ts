import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AppFooter } from '../../shared/app-footer/app-footer';
import { AppHeader } from '../../shared/app-header/app-header';
import { HeroSection } from '../../component/landing/hero-section/hero-section';
import { StoryScrollSection } from '../../component/landing/story-scroll-section/story-scroll-section';

@Component({
  selector: 'app-home-page',
  imports: [AppHeader, HeroSection, StoryScrollSection, AppFooter],
  templateUrl: './home-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HomePage {}

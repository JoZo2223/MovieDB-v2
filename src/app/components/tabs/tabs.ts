import { Component, computed, inject, input, output } from '@angular/core';
import { AppTranslateService } from '../../../service/translationService';

export type TabType = 'movies' | 'series';

@Component({
  selector: 'app-tabs',
  standalone: true,
  templateUrl: './tabs.html',
  styleUrl: './tabs.css',
})
export class TabsComponent {
  readonly activeTab = input<TabType>('movies');
  readonly tabChange = output<TabType>();

  private readonly translate = inject(AppTranslateService);

  readonly moviesLabel = computed(() => this.translate.text('tabsMovies'));
  readonly seriesLabel = computed(() => this.translate.text('tabsSeries'));

  selectTab(tab: TabType): void {
    this.tabChange.emit(tab);
  }
}
import { Component, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

export type TabType = 'movies' | 'series';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './tabs.html',
  styleUrl: './tabs.css',
})
export class TabsComponent {
  readonly activeTab = input<TabType>('movies');
  readonly tabChange = output<TabType>();

  selectTab(tab: TabType): void {
    this.tabChange.emit(tab);
  }
}

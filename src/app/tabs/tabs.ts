import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

type TabType = 'movies' | 'series';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './tabs.html',
  styleUrl: './tabs.css',
})
export class TabsComponent {
  @Input() activeTab: TabType = 'movies';
  @Output() tabChange = new EventEmitter<TabType>();

  selectTab(tab: TabType): void {
    this.tabChange.emit(tab);
  }
}

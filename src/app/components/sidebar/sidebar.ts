import { Component, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

export type MenuView = 'best' | 'favorites' | 'genres';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class SidebarComponent {
  readonly activeView = input<MenuView>('best');
  readonly viewChange = output<MenuView>();
}

import { Component, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { ClientService, GenreCard } from '../../../service/clientService';

@Component({
  selector: 'app-genre-list',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './genre-list.html',
  styleUrl: './genre-list.css',
})
export class GenreListComponent {
  readonly genres = input<GenreCard[]>([]);
  readonly genreSelected = output<GenreCard>();

  constructor(readonly client: ClientService) {}

  trackById = (_index: number, genre: GenreCard): number => genre.id;
}

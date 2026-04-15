import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-search-field',
  standalone: true,
  templateUrl: './search-field.html',
  styleUrl: './search-field.css',
})
export class SearchFieldComponent {
  readonly searchTerm = input('');
  readonly placeholder = input('');
  readonly searchTermChange = output<string>();

  onValueChange(value: string): void {
    this.searchTermChange.emit(value);
  }
}

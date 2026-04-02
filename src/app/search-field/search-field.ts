import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-field',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './search-field.html',
  styleUrl: './search-field.css'
})
export class SearchFieldComponent {
  @Input() searchTerm = '';
  @Input() placeholder = '';
  @Output() searchTermChange = new EventEmitter<string>();

  onValueChange(value: string): void {
    this.searchTermChange.emit(value);
  }
}
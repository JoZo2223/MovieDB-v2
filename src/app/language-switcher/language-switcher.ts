import { Component, computed, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageStore, Language } from '../store/language-store';
import { AppLanguageCode } from '../../assets/translations/translations';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.css',
})
export class LanguageSwitcherComponent {
  readonly store = inject(LanguageStore);
  readonly languageChange = output<AppLanguageCode>();
  readonly isOpen = signal(false);
  readonly availableLanguages = computed(() => this.store.languages);

  toggleDropdown(): void {
    this.isOpen.update((value) => !value);
  }

  setLanguage(language: Language, event: Event): void {
    event.stopPropagation();
    this.store.setLanguage(language.code);
    this.isOpen.set(false);
    this.languageChange.emit(language.code);
  }
}

import { Injectable, computed, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type Language = {
  code: 'sk' | 'en' | 'de' | 'fr' | 'es';
  label: string;
  flag: string;
};

@Injectable({
  providedIn: 'root'
})
export class LanguageStore {
  private readonly storageKey = 'selectedLanguage';
  private readonly translate = inject(TranslateService);

  readonly languages: Language[] = [
    { code: 'sk', label: 'SK', flag: '/assets/flags/sk.png' },
    { code: 'en', label: 'EN', flag: '/assets/flags/gb.png' },
    { code: 'de', label: 'DE', flag: '/assets/flags/de.png' },
    { code: 'fr', label: 'FR', flag: '/assets/flags/fr.png' },
    { code: 'es', label: 'ES', flag: '/assets/flags/es.png' }
  ];

  private readonly selectedCode = signal<Language['code']>(
    (localStorage.getItem(this.storageKey) as Language['code']) || 'en'
  );

  readonly selected = computed(() =>
    this.languages.find(l => l.code === this.selectedCode()) ?? this.languages[1]
  );

  constructor() {
    this.translate.use(this.selectedCode());
  }

  setLanguage(code: Language['code']): void {
    this.selectedCode.set(code);
    localStorage.setItem(this.storageKey, code);
    this.translate.use(code);
  }
}
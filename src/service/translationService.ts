import { Injectable, computed, inject } from '@angular/core';
import { LanguageStore } from '../app/store/language-store';
import { TRANSLATIONS, TranslationKey } from '../assets/translations/translations';

@Injectable({
  providedIn: 'root',
})
export class AppTranslateService {
  private readonly languageStore = inject(LanguageStore);

  readonly currentLanguage = computed(() => this.languageStore.selected().code);

  readonly dictionary = computed(() => TRANSLATIONS[this.currentLanguage()]);

  text(key: TranslationKey, params?: Record<string, string | number>): string {
    let value: string = this.dictionary()[key] ?? TRANSLATIONS.en[key];

    if (!params) {
      return value;
    }

    Object.entries(params).forEach(([paramKey, paramValue]) => {
      value = value.replace(`{${paramKey}}`, String(paramValue));
    });

    return value;
  }
}

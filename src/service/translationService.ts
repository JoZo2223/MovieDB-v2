import { Injectable, computed, inject } from '@angular/core';
import { LanguageStore } from '../app/languageStore/language-store';
import { TRANSLATIONS, TranslationDictionary, TranslationKey } from '../app/i18n/translations';

@Injectable({
  providedIn: 'root',
})
export class AppTranslateService {
  private readonly languageStore = inject(LanguageStore);

  readonly currentLanguage = this.languageStore.selectedLanguageCode;

  readonly dictionary = computed<TranslationDictionary>(
    () => TRANSLATIONS[this.currentLanguage()]
  );

  text(key: TranslationKey, params?: Record<string, string | number>): string {
    let value = this.dictionary()[key] ?? TRANSLATIONS.en[key];

    if (!params) {
      return value;
    }

    Object.entries(params).forEach(([paramKey, paramValue]) => {
      value = value.replace(`{${paramKey}}`, String(paramValue));
    });

    return value;
  }
}
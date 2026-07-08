import { flag } from '../utils/assetUtil';

export type AppLanguageCode = 'sk' | 'en' | 'de' | 'fr' | 'es';

export type AppLanguage = {
  code: AppLanguageCode;
  tmdbCode: 'sk-SK' | 'en-US' | 'de-DE' | 'fr-FR' | 'es-ES';
  label: string;
  flag: string;
};

export const APP_LANGUAGES = [
  {
    code: 'sk',
    label: 'Slovenčina',
    flag: 'https://flagcdn.com/w40/sk.png',
    tmdbCode: 'sk-SK',
  },
  {
    code: 'en',
    label: 'English',
    flag: 'https://flagcdn.com/w40/gb.png',
    tmdbCode: 'en-US',
  },
  {
    code: 'de',
    label: 'Deutsch',
    flag: 'https://flagcdn.com/w40/de.png',
    tmdbCode: 'de-DE',
  },
  {
    code: 'fr',
    label: 'Français',
    flag: 'https://flagcdn.com/w40/fr.png',
    tmdbCode: 'fr-FR',
  },
  {
    code: 'es',
    label: 'Español',
    flag: 'https://flagcdn.com/w40/es.png',
    tmdbCode: 'es-ES',
  },
] as const;

export const DEFAULT_LANGUAGE_CODE: AppLanguageCode = 'en';
export const LANGUAGE_STORAGE_KEY = 'selectedLanguage';

export function isAppLanguageCode(value: string | null | undefined): value is AppLanguageCode {
  return APP_LANGUAGES.some((language) => language.code === value);
}

export function readStoredLanguage(): AppLanguageCode {
  const value = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return isAppLanguageCode(value) ? value : DEFAULT_LANGUAGE_CODE;
}

export function normalizeLanguageCode(value: string | null | undefined): AppLanguageCode {
  return isAppLanguageCode(value) ? value : DEFAULT_LANGUAGE_CODE;
}

export function getLanguageByCode(value: string | null | undefined): AppLanguage {
  const code = normalizeLanguageCode(value);
  return APP_LANGUAGES.find((language) => language.code === code) ?? APP_LANGUAGES[1];
}

export function persistLanguage(code: AppLanguageCode): void {
  localStorage.setItem(LANGUAGE_STORAGE_KEY, code);
}

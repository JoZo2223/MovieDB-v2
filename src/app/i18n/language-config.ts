import { flag } from '../utils/assetUtil';

export type AppLanguageCode = 'sk' | 'en' | 'de' | 'fr' | 'es';

export type AppLanguage = {
  code: AppLanguageCode;
  tmdbCode: 'sk-SK' | 'en-US' | 'de-DE' | 'fr-FR' | 'es-ES';
  label: string;
  flag: string;
};

export const APP_LANGUAGES: readonly AppLanguage[] = [
  { code: 'sk', tmdbCode: 'sk-SK', label: 'SK', flag: flag('sk') },
  { code: 'en', tmdbCode: 'en-US', label: 'EN', flag: flag('gb') },
  { code: 'de', tmdbCode: 'de-DE', label: 'DE', flag: flag('de') },
  { code: 'fr', tmdbCode: 'fr-FR', label: 'FR', flag: flag('fr') },
  { code: 'es', tmdbCode: 'es-ES', label: 'ES', flag: flag('es') },
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

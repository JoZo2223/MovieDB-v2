import { Injectable } from '@angular/core';
import { environment } from '../../enviroment';
import { TmdbItem, TmdbTranslation, TmdbTranslationsResponse } from './clientService';

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  getPosterUrl(path: string | null): string {
    return path ? `${environment.tmdbImageBaseUrl}${path}` : '';
  }

  getDisplayTitle(item: Pick<TmdbItem, 'title' | 'name'> | undefined, fallback = 'Untitled'): string {
    return item?.title || item?.name || fallback;
  }

  getDisplayDate(
    item: Pick<TmdbItem, 'release_date' | 'first_air_date'> | undefined,
    fallback = 'Unknown date',
  ): string {
    return item?.release_date || item?.first_air_date || fallback;
  }

  getTranslatedOverview(
    translations: TmdbTranslationsResponse | undefined,
    tmdbCode: string,
    code: string,
  ): string {
    const [iso639, iso3166] = tmdbCode.split('-');
    const translationList = translations?.translations ?? [];

    const exactMatch = translationList.find(
      (translation) =>
        this.matchesTranslation(translation, iso639, iso3166) && Boolean(translation.data?.overview?.trim()),
    );

    if (exactMatch?.data?.overview) {
      return exactMatch.data.overview;
    }

    const languageOnlyMatch = translationList.find(
      (translation) =>
        translation.iso_639_1?.toLowerCase() === code.toLowerCase() &&
        Boolean(translation.data?.overview?.trim()),
    );

    return languageOnlyMatch?.data?.overview ?? '';
  }

  private matchesTranslation(
    translation: TmdbTranslation,
    iso639: string,
    iso3166: string,
  ): boolean {
    return (
      translation.iso_639_1?.toLowerCase() === iso639.toLowerCase() &&
      translation.iso_3166_1?.toUpperCase() === iso3166.toUpperCase()
    );
  }
}

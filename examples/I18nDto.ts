export default interface I18nDto {
  /** i18n resource id */
  id: string;

  /**
   * iso639-1 language code
   *
   * @minLength 2
   * @maxLength 5
   * */
  language: string;

  /** i18n resource content */
  content: string;

  /**
   * i18n resource use on
   *
   * @minItems 1
   * @maxItems 10
   * */
  used?: string[];
}

export interface ILanguageDto {
  /** language id */
  id: string;

  /** language code iso639-1 */
  $code: string;

  /** language symbol, description */
  content: string;
}

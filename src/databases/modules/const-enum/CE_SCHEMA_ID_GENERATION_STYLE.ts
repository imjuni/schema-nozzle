export const CE_SCHEMA_ID_GENERATION_STYLE = {
  /**
   * ID only
   *
   * @example IHero
   * @see https://github.com/imjuni/json-schema-study/blob/main/src/example01.ts
   */
  ID: 'id',

  /**
   * ID with schema file path
   *
   * @example ability/IHero
   * @see https://github.com/imjuni/json-schema-study/blob/main/src/example02.ts
   */
  ID_WITH_PATH: 'id-with-path',

  /**
   * definitions
   *
   * @example { $defs: { IHero: { ... } } }
   * @see https://github.com/imjuni/json-schema-study/blob/main/src/example03.ts
   */
  DEFINITIONS: 'definitions',

  /**
   * definitions with schema file path
   *
   * @example { $defs: { ability: { IHero: { ... } } } }
   * @see https://github.com/imjuni/json-schema-study/blob/main/src/example04.ts
   */
  DEFINITIONS_WITH_PATH: 'definitions-with-path',
} as const;

export type CE_SCHEMA_ID_GENERATION_STYLE =
  (typeof CE_SCHEMA_ID_GENERATION_STYLE)[keyof typeof CE_SCHEMA_ID_GENERATION_STYLE];

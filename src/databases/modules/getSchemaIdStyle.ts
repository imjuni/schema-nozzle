import { CE_SCHEMA_ID_GENERATION_STYLE } from '#/databases/modules/const-enum/CE_SCHEMA_ID_GENERATION_STYLE';
import { isFalse } from 'my-easy-fp';

export function getSchemaIdStyle(options: {
  /** use topRef configuration in generatorOption */
  topRef: boolean;

  /** include path in schema id */
  useSchemaPath: boolean;
}) {
  if (isFalse(options.topRef) && options.useSchemaPath) {
    return CE_SCHEMA_ID_GENERATION_STYLE.ID_WITH_PATH;
  }

  if (options.topRef && isFalse(options.useSchemaPath)) {
    return CE_SCHEMA_ID_GENERATION_STYLE.DEFINITIONS;
  }

  if (options.topRef && options.useSchemaPath) {
    return CE_SCHEMA_ID_GENERATION_STYLE.DEFINITIONS_WITH_PATH;
  }

  return CE_SCHEMA_ID_GENERATION_STYLE.ID;
}

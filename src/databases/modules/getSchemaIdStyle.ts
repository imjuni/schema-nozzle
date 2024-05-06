import { CE_SCHEMA_ID_GENERATION_STYLE } from '#/databases/modules/const-enum/CE_SCHEMA_ID_GENERATION_STYLE';
import { isFalse } from 'my-easy-fp';

export function getSchemaIdStyle(option: {
  /** use topRef configuration in generatorOption */
  topRef: boolean;

  /** include path in schema id */
  useSchemaPath: boolean;
}) {
  if (isFalse(option.topRef) && option.useSchemaPath) {
    return CE_SCHEMA_ID_GENERATION_STYLE.ID_WITH_PATH;
  }

  if (option.topRef && isFalse(option.useSchemaPath)) {
    return CE_SCHEMA_ID_GENERATION_STYLE.DEFINITIONS;
  }

  if (option.topRef && option.useSchemaPath) {
    return CE_SCHEMA_ID_GENERATION_STYLE.DEFINITIONS_WITH_PATH;
  }

  return CE_SCHEMA_ID_GENERATION_STYLE.ID;
}

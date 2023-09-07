import fastSafeStringify from 'fast-safe-stringify';
import type { JSONSchema7 } from 'json-schema';
import { CE_OUTPUT_FORMAT } from 'src/configs/interfaces/CE_OUTPUT_FORMAT';

export default function getFormattedSchema(format: CE_OUTPUT_FORMAT, schema: JSONSchema7) {
  if (format === CE_OUTPUT_FORMAT.STRING) {
    return fastSafeStringify(schema);
  }

  if (format === CE_OUTPUT_FORMAT.BASE64) {
    return Buffer.from(fastSafeStringify(schema)).toString('base64');
  }

  return schema;
}

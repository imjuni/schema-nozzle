import { TOUTPUT_FORMAT } from '@configs/interfaces/TOUTPUT_FORMAT';
import fastSafeStringify from 'fast-safe-stringify';
import type { JSONSchema7 } from 'json-schema';

export default function getFormattedSchema(format: TOUTPUT_FORMAT, schema: JSONSchema7) {
  if (format === TOUTPUT_FORMAT.STRING) {
    return fastSafeStringify(schema);
  }

  if (format === TOUTPUT_FORMAT.BASE64) {
    return Buffer.from(fastSafeStringify(schema)).toString('base64');
  }

  return schema;
}

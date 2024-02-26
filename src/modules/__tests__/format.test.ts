import { CE_OUTPUT_FORMAT } from '#/configs/interfaces/CE_OUTPUT_FORMAT';
import getFormattedSchema from '#/modules/getFormattedSchema';
import { describe, expect, it } from 'vitest';

describe('getFormattedSchema', () => {
  it('string', () => {
    const formatted = getFormattedSchema(CE_OUTPUT_FORMAT.STRING, { $id: 'sample-schema' });
    expect(formatted).toEqual('{"$id":"sample-schema"}');
  });

  it('base64', () => {
    const formatted = getFormattedSchema(CE_OUTPUT_FORMAT.BASE64, { $id: 'sample-schema' });
    expect(formatted).toEqual('eyIkaWQiOiJzYW1wbGUtc2NoZW1hIn0=');
  });

  it('object', () => {
    const formatted = getFormattedSchema(CE_OUTPUT_FORMAT.JSON, { $id: 'sample-schema' });
    expect(formatted).toMatchObject({ $id: 'sample-schema' });
  });
});

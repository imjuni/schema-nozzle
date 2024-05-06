import { CE_SCHEMA_ID_GENERATION_STYLE } from '#/databases/modules/const-enum/CE_SCHEMA_ID_GENERATION_STYLE';
import { getSchemaIdStyle } from '#/databases/modules/getSchemaIdStyle';
import { describe, expect, it } from 'vitest';

describe('getSchemaIdStyle', () => {
  it('every case', () => {
    const r01 = getSchemaIdStyle({ topRef: true, useSchemaPath: true });
    const r02 = getSchemaIdStyle({ topRef: true, useSchemaPath: false });
    const r03 = getSchemaIdStyle({ topRef: false, useSchemaPath: true });
    const r04 = getSchemaIdStyle({ topRef: false, useSchemaPath: false });

    expect(r01).toEqual(CE_SCHEMA_ID_GENERATION_STYLE.DEFINITIONS_WITH_PATH);
    expect(r02).toEqual(CE_SCHEMA_ID_GENERATION_STYLE.DEFINITIONS);
    expect(r03).toEqual(CE_SCHEMA_ID_GENERATION_STYLE.ID_WITH_PATH);
    expect(r04).toEqual(CE_SCHEMA_ID_GENERATION_STYLE.ID);
  });
});

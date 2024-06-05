import { replaceDraft } from '#/databases/replaceDraft';
import { describe, expect, it } from 'vitest';

describe('replaceDraft', () => {
  it('draft 8', () => {
    const version = replaceDraft('http://json-schema.org/draft-07/schema#', 8);
    expect(version).toEqual('http://json-schema.org/draft-08/schema#');
  });
});

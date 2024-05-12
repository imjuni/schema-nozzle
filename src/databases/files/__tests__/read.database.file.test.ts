import { readDatabaseFile } from '#/databases/files/readDatabaseFile';
import fs from 'fs/promises';
import * as mnf from 'my-node-fp';
import { describe, expect, it, vitest } from 'vitest';

vitest.mock('my-node-fp', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const mod = await importOriginal<typeof import('my-node-fp')>();
  return {
    ...mod,
  };
});

vitest.mock('my-node-fp', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const mod = await importOriginal<typeof import('my-node-fp')>();
  return {
    ...mod,
  };
});

describe('readDatabaseFile', () => {
  it('non exists database file', async () => {
    const handle = vitest
      .spyOn(mnf, 'exists')
      .mockImplementationOnce((_filePath: string) => Promise.resolve(false));

    const db = await readDatabaseFile('test');

    handle.mockRestore();

    expect(db).toMatchObject({ schemas: [], refs: [] });
  });

  it('non exists database file', async () => {
    const handle01 = vitest
      .spyOn(mnf, 'exists')
      .mockImplementationOnce((_filePath: string) => Promise.resolve(true));
    const handle02 = vitest
      .spyOn(fs, 'readFile')
      .mockImplementationOnce(() =>
        Promise.resolve(Buffer.from('{"schemas":[{"id":"test"}],"refs":[]}')),
      );

    const db = await readDatabaseFile('test');

    handle01.mockRestore();
    handle02.mockRestore();

    expect(db).toMatchObject({ schemas: [{ id: 'test' }], refs: [] });
  });
});

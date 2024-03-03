import { CE_DEFAULT_VALUE } from '#/configs/const-enum/CE_DEFAULT_VALUE';
import { getDatabaseFilePath } from '#/databases/files/getDatabaseFilePath';
import path from 'node:path';
import { describe, expect, it, vitest } from 'vitest';

vitest.mock('my-node-fp', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const mod = await importOriginal<typeof import('my-node-fp')>();
  return {
    ...mod,
  };
});

describe('getDatabaseFilePath', () => {
  it('pass - directory', async () => {
    const r = await getDatabaseFilePath({ output: path.join(process.cwd(), 'examples') });
    expect(r).toEqual(path.join(process.cwd(), 'examples', CE_DEFAULT_VALUE.DB_FILE_NAME));
  });

  it('pass - file', async () => {
    const r = await getDatabaseFilePath({
      output: path.join(process.cwd(), 'examples', 'tsconfig.json'),
    });
    expect(r).toEqual(path.join(process.cwd(), 'examples', 'tsconfig.json'));
  });
});

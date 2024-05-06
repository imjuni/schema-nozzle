import { CE_DEFAULT_VALUE } from '#/configs/const-enum/CE_DEFAULT_VALUE';
import { getDatabaseFilePath } from '#/databases/files/getDatabaseFilePath';
import { makeDatabase } from '#/databases/files/makeDatabase';
import pathe from 'pathe';
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
    const r = await getDatabaseFilePath({ output: pathe.join(process.cwd(), 'examples') });
    expect(r).toEqual(pathe.join(process.cwd(), 'examples', CE_DEFAULT_VALUE.DB_FILE_NAME));
  });

  it('pass - file', async () => {
    const r = await getDatabaseFilePath({
      output: pathe.join(process.cwd(), 'examples', 'tsconfig.json'),
    });
    expect(r).toEqual(pathe.join(process.cwd(), 'examples', 'tsconfig.json'));
  });
});

describe('makeAlaSQL', () => {
  it('make-ala-sql', async () => {
    await makeDatabase(pathe.join(process.cwd(), 'examples', 'db-for-test.json'));
  });
});

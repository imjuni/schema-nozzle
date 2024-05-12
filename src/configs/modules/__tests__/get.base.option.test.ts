import { CE_DEFAULT_VALUE } from '#/configs/const-enum/CE_DEFAULT_VALUE';
import { getBaseOption } from '#/configs/modules/getBaseOption';
import pathe from 'pathe';
import { describe, expect, it } from 'vitest';

describe('getBaseOption', () => {
  it('nullable field with base option', () => {
    const option = getBaseOption({
      project: 'tsconfig.json',
    });

    expect(option).toEqual({
      config: undefined,
      project: 'tsconfig.json',
      output: '.',
      cliLogo: false,
      verbose: false,
    });
  });

  it('non-nullable field with base option', () => {
    const option = getBaseOption({
      config: CE_DEFAULT_VALUE.CONFIG_FILE_NAME,
      project: 'tsconfig.json',
      output: 'examples',
      cliLogo: true,
      verbose: true,
    });

    expect(option).toEqual({
      config: CE_DEFAULT_VALUE.CONFIG_FILE_NAME,
      project: 'tsconfig.json',
      output: pathe.resolve(pathe.join($context.tsconfigDirPath, '..')),
      cliLogo: true,
      verbose: true,
    });
  });
});

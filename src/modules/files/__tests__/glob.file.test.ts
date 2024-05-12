import { getGlobFiles } from '#/modules/files/getGlobFiles';
import { Glob } from 'glob';
import pathe from 'pathe';
import { describe, expect, it } from 'vitest';

describe('getGlobFiles', () => {
  it('globe file from examples', () => {
    const files = new Glob(['**/*.ts'], {
      cwd: $context.tsconfigDirPath,
    });

    const r01 = getGlobFiles(files);
    expect(r01).toMatchObject([
      'hello.ts',
      'TSimpleSetRequired.ts',
      'TGenericExample.ts',
      'IStudentEntity.ts',
      'IStudentDto.ts',
      'ISlackMessage.ts',
      'IReqReadStudentDto.ts',
      'IProfessorEntity.ts',
      'IProfessorDto.ts',
      'I18nDto.ts',
      'const-enum/CE_MAJOR.ts',
      'base/ITid.ts',
    ]);
  });

  it('globe file from examples', () => {
    const files = new Glob(['**/*.ts'], {
      cwd: $context.tsconfigDirPath,
      withFileTypes: true,
    });
    const r01 = getGlobFiles(files);
    expect(r01).toMatchObject([
      pathe.join($context.tsconfigDirPath, 'hello.ts'),
      pathe.join($context.tsconfigDirPath, 'TSimpleSetRequired.ts'),
      pathe.join($context.tsconfigDirPath, 'TGenericExample.ts'),
      pathe.join($context.tsconfigDirPath, 'IStudentEntity.ts'),
      pathe.join($context.tsconfigDirPath, 'IStudentDto.ts'),
      pathe.join($context.tsconfigDirPath, 'ISlackMessage.ts'),
      pathe.join($context.tsconfigDirPath, 'IReqReadStudentDto.ts'),
      pathe.join($context.tsconfigDirPath, 'IProfessorEntity.ts'),
      pathe.join($context.tsconfigDirPath, 'IProfessorDto.ts'),
      pathe.join($context.tsconfigDirPath, 'I18nDto.ts'),
      pathe.join($context.tsconfigDirPath, 'const-enum/CE_MAJOR.ts'),
      pathe.join($context.tsconfigDirPath, 'base/ITid.ts'),
    ]);
  });
});

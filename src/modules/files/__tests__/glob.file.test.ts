import { getGlobFiles } from '#/modules/files/getGlobFiles';
import { Glob } from 'glob';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('getGlobFiles', () => {
  it('globe file from examples', () => {
    const files = new Glob(['**/*.ts'], { cwd: path.join(process.cwd(), 'examples') });
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
});

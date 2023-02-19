import getResolvedPaths from '#configs/getResolvedPaths';
import { CE_DEFAULT_VALUE } from '#configs/interfaces/CE_DEFAULT_VALUE';
import getSchemaFileContent from '#modules/getSchemaFileContent';
import * as fpm from '#modules/getSchemaFilterFilePath';
import summarySchemaFiles from '#modules/summarySchemaFiles';
import summarySchemaTypes from '#modules/summarySchemaTypes';
import 'jest';
import path from 'path';
import * as tsm from 'ts-morph';

const getSchemaFilterFilePath = fpm.default;

const originPath = process.env.INIT_CWD!;
const data: { project: tsm.Project; resolvedPaths: ReturnType<typeof getResolvedPaths> } =
  {} as any;

beforeAll(async () => {
  data.project = new tsm.Project({
    tsConfigFilePath: path.join(originPath, 'examples', 'tsconfig.json'),
  });
});

beforeEach(() => {
  process.env.INIT_CWD = path.join(originPath, 'examples');
  data.resolvedPaths = getResolvedPaths({
    project: path.join(originPath, 'examples', 'tsconfig.json'),
    output: path.join(originPath, 'examples'),
  });
});

describe('getSchemaListFilePath', () => {
  test('undefined', async () => {
    process.env.INIT_CWD = originPath;
    data.resolvedPaths = getResolvedPaths({
      project: path.join(originPath, 'tsconfig.json'),
      output: originPath,
    });
    const result = await getSchemaFilterFilePath(data.resolvedPaths.cwd);
    expect(result).toBeUndefined();
  });

  test('resolved', async () => {
    const f = path.join('.', 'examples', CE_DEFAULT_VALUE.LIST_FILE_NAME);
    const result = await getSchemaFilterFilePath(data.resolvedPaths.cwd, f);
    expect(result).toEqual(path.resolve(f));
  });

  test('default', async () => {
    process.env.INIT_CWD = path.resolve(path.join(process.env.INIT_CWD!, 'examples'));
    const f = path.join('.', 'examples', CE_DEFAULT_VALUE.LIST_FILE_NAME);
    const result = await getSchemaFilterFilePath(data.resolvedPaths.cwd);
    expect(result).toEqual(path.resolve(f));
  });
});

describe('getSchemaFileContent', () => {
  test('exist file', async () => {
    const lines = await getSchemaFileContent(
      path.join(data.resolvedPaths.cwd, CE_DEFAULT_VALUE.LIST_FILE_NAME),
    );
    expect(lines).toMatchObject(['*.ts']);
  });
});

describe('summarySchemaFiles', () => {
  test('files', async () => {
    const filter = await summarySchemaFiles(data.project, {
      discriminator: 'add-schema',
      files: ['IProfessorEntity.ts'],
      cwd: data.resolvedPaths.cwd,
    });

    expect(filter.filter.ignores('IProfessorEntity.ts')).toBeTruthy();
  });

  test('empty list file', async () => {
    jest.spyOn(fpm, 'default').mockImplementationOnce(async () => undefined);

    const filter = await summarySchemaFiles(data.project, {
      discriminator: 'refresh-schema',
      listFile: undefined,
      files: [],
      cwd: data.resolvedPaths.cwd,
    });

    expect(filter.filter.ignores('I18nDto.ts')).toBeTruthy();
  });

  test('file hit test', async () => {
    const listFile = path.join(data.resolvedPaths.cwd, 'examples', CE_DEFAULT_VALUE.LIST_FILE_NAME);
    const filter = await summarySchemaFiles(data.project, {
      discriminator: 'add-schema',
      files: [],
      listFile,
      cwd: data.resolvedPaths.cwd,
    });

    expect(filter.filter.ignores('I18nDto.ts')).toBeTruthy();
  });
});

describe('summarySchemaTypes', () => {
  test('empty types', async () => {
    const r = await summarySchemaTypes(data.project, {
      discriminator: 'add-schema',
      types: [],
      cwd: data.resolvedPaths.cwd,
    });

    expect(r).toMatchObject([
      {
        identifier: 'CE_MAJOR',
        filePath: path.join(originPath, 'examples', 'CE_MAJOR.ts'),
      },
      {
        identifier: 'I18nDto',
        filePath: path.join(originPath, 'examples', 'I18nDto.ts'),
      },
      {
        identifier: 'ILanguageDto',
        filePath: path.join(originPath, 'examples', 'I18nDto.ts'),
      },
      {
        identifier: 'IProfessorDto',
        filePath: path.join(originPath, 'examples', 'IProfessorDto.ts'),
      },
      {
        identifier: 'IProfessorEntity',
        filePath: path.join(originPath, 'examples', 'IProfessorEntity.ts'),
      },
      {
        identifier: 'IReqReadStudentQuerystring',
        filePath: path.join(originPath, 'examples', 'IReqReadStudentDto.ts'),
      },
      {
        identifier: 'IReqReadStudentParam',
        filePath: path.join(originPath, 'examples', 'IReqReadStudentDto.ts'),
      },
      {
        identifier: 'ISlackMessageBotProfile',
        filePath: path.join(originPath, 'examples', 'ISlackMessage.ts'),
      },
      {
        identifier: 'ISlackMessageBody',
        filePath: path.join(originPath, 'examples', 'ISlackMessage.ts'),
      },
      {
        identifier: 'IStudentDto',
        filePath: path.join(originPath, 'examples', 'IStudentDto.ts'),
      },
      {
        identifier: 'IStudentEntity',
        filePath: path.join(originPath, 'examples', 'IStudentEntity.ts'),
      },
      {
        identifier: 'TGenericExample',
        filePath: path.join(originPath, 'examples', 'TGenericExample.ts'),
      },
    ]);
  });

  test('types', async () => {
    const r = await summarySchemaTypes(data.project, {
      discriminator: 'add-schema',
      types: [
        'ILanguageDto',
        'TGenericExample',
        'IReqReadStudentQuerystring',
        'IReqReadStudentParam',
      ],
      cwd: data.resolvedPaths.cwd,
    });

    expect(r).toMatchObject([
      {
        identifier: 'ILanguageDto',
        filePath: path.join(originPath, 'examples', 'I18nDto.ts'),
      },
      {
        identifier: 'IReqReadStudentQuerystring',
        filePath: path.join(originPath, 'examples', 'IReqReadStudentDto.ts'),
      },
      {
        identifier: 'IReqReadStudentParam',
        filePath: path.join(originPath, 'examples', 'IReqReadStudentDto.ts'),
      },
      {
        identifier: 'TGenericExample',
        filePath: path.join(originPath, 'examples', 'TGenericExample.ts'),
      },
    ]);
  });
});

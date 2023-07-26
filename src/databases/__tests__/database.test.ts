import getResolvedPaths from '#configs/getResolvedPaths';
import { CE_DEFAULT_VALUE } from '#configs/interfaces/CE_DEFAULT_VALUE';
import type TAddSchemaOption from '#configs/interfaces/TAddSchemaOption';
import getDatabaseFilePath from '#databases/getDatabaseFilePath';
import openDatabase from '#databases/openDatabase';
import * as env from '#modules/__tests__/env';
import fs from 'fs/promises';
import 'jest';
import * as mnf from 'my-node-fp';
import path from 'path';

const originPath = process.env.INIT_CWD!;
const data: {
  resolvedPaths: ReturnType<typeof getResolvedPaths>;
  db: any;
} = {} as any;

beforeEach(() => {
  process.env.INIT_CWD = path.join(originPath, 'examples');
  data.resolvedPaths = getResolvedPaths({
    project: path.join(originPath, 'examples', 'tsconfig.json'),
    output: path.join(originPath, 'examples'),
  });
  data.db = {
    IReqReadStudentQuerystring: {
      id: 'IReqReadStudentQuerystring',
      filePath: 'IReqReadStudentDto.ts',
      dependency: {
        import: {
          name: 'IReqReadStudentQuerystring',
          from: ['I18nDto', 'CE_MAJOR'],
        },
        export: {
          name: 'IReqReadStudentQuerystring',
          to: [],
        },
      },
      schema: {
        $id: 'IReqReadStudentQuerystring',
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          name: {
            $ref: 'I18nDto',
          },
          major: {
            $ref: 'CE_MAJOR',
          },
        },
        required: ['name', 'major'],
      },
    },
  };
});

describe('getDatabaseFilePath', () => {
  test('pass - directory', async () => {
    const r = await getDatabaseFilePath({ output: data.resolvedPaths.cwd });
    expect(r).toEqual(path.join(data.resolvedPaths.cwd, CE_DEFAULT_VALUE.DB_FILE_NAME));
  });

  test('pass - file', async () => {
    const r = await getDatabaseFilePath({
      output: path.join(data.resolvedPaths.cwd, 'abcd.json'),
    });
    expect(r).toEqual(path.join(data.resolvedPaths.cwd, 'abcd.json'));
  });
});

describe('open database', () => {
  test('openDatabase', async () => {
    const option: TAddSchemaOption = { ...env.addCmdOption, ...data.resolvedPaths };
    jest
      .spyOn(fs, 'readFile')
      .mockImplementationOnce(() => Promise.resolve(Buffer.from(JSON.stringify(data.db))));
    jest.spyOn(mnf, 'exists').mockImplementationOnce(() => Promise.resolve(true));

    const db = await openDatabase(option);
    expect(db).toMatchObject(data.db);
  });

  test('openDatabase - invalid file name', async () => {
    const option: TAddSchemaOption = { ...env.addCmdOption, ...data.resolvedPaths };
    option.output = 'aa11';
    const db = await openDatabase(option);
    expect(db).toMatchObject({});
  });

  test('openDatabase - invalid json', async () => {
    try {
      const option: TAddSchemaOption = {
        ...env.addCmdOption,
        ...data.resolvedPaths,
        output: data.resolvedPaths.project,
      };
      jest
        .spyOn(fs, 'readFile')
        .mockImplementationOnce(() => Promise.resolve(Buffer.from(`${JSON.stringify(data.db)}}}`)));
      await openDatabase(option);
    } catch (caught) {
      expect(caught).toBeTruthy();
    }
  });
});

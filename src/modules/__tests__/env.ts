import { CE_OUTPUT_FORMAT } from '#/configs/const-enum/CE_OUTPUT_FORMAT';
import type { IBaseOption } from '#/configs/interfaces/IBaseOption';
import type { TAddSchemaOption } from '#/configs/interfaces/TAddSchemaOption';
import type { TDeleteSchemaOption } from '#/configs/interfaces/TDeleteSchemaOption';
import type { TRefreshSchemaOption } from '#/configs/interfaces/TRefreshSchemaOption';

export const baseOption: IBaseOption = {
  config: undefined,
  project: './tsconfig.json',
  types: [],
  skipError: true,
  output: '.',
  cliLogo: false,
};

export const addCmdOption: TAddSchemaOption = {
  ...baseOption,
  projectDir: '.',
  discriminator: 'add-schema',
  files: [],
  multiple: false,
  generatorOption: {},
  cwd: '',
  listFile: '',
  include: [],
  exclude: [],
  includePath: false,
  format: CE_OUTPUT_FORMAT.JSON,
  generatorOptionObject: {},
};

export const refreshCmdOption: TRefreshSchemaOption = {
  ...baseOption,
  projectDir: '.',
  discriminator: 'refresh-schema',
  generatorOption: {},
  format: CE_OUTPUT_FORMAT.JSON,
  cwd: '',
  listFile: '',
  include: [],
  exclude: [],
  files: [],
  includePath: false,
  generatorOptionObject: {},
};

export const deleteCmdOption: TDeleteSchemaOption = {
  ...baseOption,
  discriminator: 'delete-schema',
  multiple: false,
};

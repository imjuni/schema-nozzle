import { CE_DEFAULT_VALUE } from 'src/configs/interfaces/CE_DEFAULT_VALUE';
import { CE_OUTPUT_FORMAT } from 'src/configs/interfaces/CE_OUTPUT_FORMAT';
import type IBaseOption from 'src/configs/interfaces/IBaseOption';
import type TAddSchemaOption from 'src/configs/interfaces/TAddSchemaOption';
import type TDeleteSchemaOption from 'src/configs/interfaces/TDeleteSchemaOption';
import type TRefreshSchemaOption from 'src/configs/interfaces/TRefreshSchemaOption';

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
  discriminator: 'add-schema',
  files: [],
  multiple: false,
  generatorOption: {},
  cwd: '',
  listFile: '',
  format: CE_OUTPUT_FORMAT.JSON,
  generatorOptionObject: {},
  generatorTimeout: CE_DEFAULT_VALUE.DEFAULT_TASK_WAIT_SECOND * 3,
};

export const refreshCmdOption: TRefreshSchemaOption = {
  ...baseOption,
  discriminator: 'refresh-schema',
  generatorOption: {},
  format: CE_OUTPUT_FORMAT.JSON,
  cwd: '',
  listFile: '',
  files: [],
  generatorOptionObject: {},
  generatorTimeout: CE_DEFAULT_VALUE.DEFAULT_TASK_WAIT_SECOND * 3,
};

export const deleteCmdOption: TDeleteSchemaOption = {
  ...baseOption,
  discriminator: 'delete-schema',
  multiple: false,
};

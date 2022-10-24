import IAddSchemaOption from '@configs/interfaces/IAddSchemaOption';
import IBaseOption from '@configs/interfaces/IBaseOption';
import IDeleteSchemaOption from '@configs/interfaces/IDeleteSchemaOption';

export const baseOption: IBaseOption = {
  config: undefined,
  project: '.',
  files: [],
  types: [],
  noBanner: true,
  skipError: true,
  prefix: undefined,
  postfix: undefined,
  verbose: false,
  output: '.',
};

export const addCmdOption: IAddSchemaOption = {
  ...baseOption,
  type: 'add-schema',
};

export const deleteCmdOption: IDeleteSchemaOption = {
  ...baseOption,
  type: 'delete-schema',
};

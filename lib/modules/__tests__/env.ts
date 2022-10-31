import IAddSchemaOption from '@configs/interfaces/IAddSchemaOption';
import IBaseOption from '@configs/interfaces/IBaseOption';
import IDeleteSchemaOption from '@configs/interfaces/IDeleteSchemaOption';

export const baseOption: IBaseOption = {
  config: undefined,
  project: '.',
  types: [],
  skipError: true,
  output: '.',
};

export const addCmdOption: IAddSchemaOption = {
  ...baseOption,
  discriminator: 'add-schema',
  files: [],
  multiple: false,
  generatorOption: {},
};

export const deleteCmdOption: IDeleteSchemaOption = {
  ...baseOption,
  discriminator: 'delete-schema',
  multiple: false,
};

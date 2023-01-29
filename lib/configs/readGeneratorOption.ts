import type IAddSchemaOption from '@configs/interfaces/IAddSchemaOption';
import type IRefreshSchemaOption from '@configs/interfaces/IRefreshSchemaOption';
import fs from 'fs';
import { parse } from 'jsonc-parser';
import { exists } from 'my-node-fp';
import path from 'path';
import type * as tjsg from 'ts-json-schema-generator';

export default async function readGeneratorOption(
  option: (IAddSchemaOption | IRefreshSchemaOption) & { 'generator-option'?: string | tjsg.Config },
): Promise<tjsg.Config> {
  const generatorOptionFilePath =
    'generator-option' in option ? option['generator-option'] : option.generatorOption;
  if (generatorOptionFilePath == null) {
    return {};
  }

  if (typeof generatorOptionFilePath === 'object') {
    return generatorOptionFilePath;
  }

  if (typeof generatorOptionFilePath === 'string') {
    const filePath = path.isAbsolute(generatorOptionFilePath)
      ? generatorOptionFilePath
      : path.resolve(generatorOptionFilePath);

    if ((await exists(filePath)) === true) {
      const configBuf = await fs.promises.readFile(filePath);
      const config = parse(configBuf.toString());
      return config;
    }

    throw new Error('generator option file not exists');
  }

  throw new Error('Invalid generator option');
}

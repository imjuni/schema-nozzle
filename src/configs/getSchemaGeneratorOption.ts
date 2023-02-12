import type TAddSchemaOption from '#configs/interfaces/TAddSchemaOption';
import type TRefreshSchemaOption from '#configs/interfaces/TRefreshSchemaOption';
import fs from 'fs';
import { parse } from 'jsonc-parser';
import { exists } from 'my-node-fp';
import path from 'path';
import type * as tjsg from 'ts-json-schema-generator';

const defaultGeneratorOption: tjsg.Config = {
  minify: false,
  expose: 'export',
  topRef: false,
  jsDoc: 'extended',
  sortProps: true,
  strictTuples: true,
  encodeRefs: true,
  additionalProperties: true,
};

export default async function getSchemaGeneratorOption(
  option:
    | Pick<TAddSchemaOption, 'discriminator' | 'project' | 'generatorOption' | 'skipError'>
    | Pick<TRefreshSchemaOption, 'discriminator' | 'project' | 'generatorOption' | 'skipError'>,
): Promise<tjsg.Config> {
  if (option.generatorOption == null) {
    const generatorOption: tjsg.Config = {
      ...defaultGeneratorOption,
      tsconfig: option.project,
      skipTypeCheck: option.skipError,
    };

    return generatorOption;
  }

  if (typeof option.generatorOption === 'object') {
    return option.generatorOption;
  }

  const filePath = path.isAbsolute(option.generatorOption)
    ? option.generatorOption
    : path.resolve(option.generatorOption);

  if (await exists(filePath)) {
    const configBuf = await fs.promises.readFile(filePath);
    const config = parse(configBuf.toString()) as tjsg.Config;
    return config;
  }

  throw new Error(`cannot found generator option file: ${filePath}`);
}

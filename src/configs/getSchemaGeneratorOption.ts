import type { TAddSchemaOption } from '#/configs/interfaces/TAddSchemaOption';
import type { TDeleteSchemaOption } from '#/configs/interfaces/TDeleteSchemaOption';
import type { TRefreshSchemaOption } from '#/configs/interfaces/TRefreshSchemaOption';
import fs from 'fs';
import { parse } from 'jsonc-parser';
import { exists } from 'my-node-fp';
import path from 'node:path';
import type { Config } from 'ts-json-schema-generator';

const defaultGeneratorOption: Config = {
  minify: false,
  expose: 'export',
  jsDoc: 'extended',
  sortProps: true,
  strictTuples: true,
  encodeRefs: false,
  additionalProperties: false,
};

export async function getSchemaGeneratorOption(
  option:
    | Pick<TAddSchemaOption, '$kind' | 'project' | 'generatorOption' | 'skipError'>
    | Pick<TRefreshSchemaOption, '$kind' | 'project' | 'generatorOption' | 'skipError'>
    | Pick<TDeleteSchemaOption, '$kind' | 'project' | 'generatorOption' | 'skipError'>,
): Promise<Config> {
  const topRef = false;

  if (option.generatorOption == null) {
    const generatorOption: Config = {
      ...defaultGeneratorOption,
      tsconfig: option.project,
      skipTypeCheck: option.skipError,
      topRef,
    };

    return generatorOption;
  }

  if (typeof option.generatorOption === 'object') {
    return {
      ...defaultGeneratorOption,
      tsconfig: option.project,
      skipTypeCheck: option.skipError,
      ...option.generatorOption,
      topRef,
    };
  }

  const filePath = path.isAbsolute(option.generatorOption)
    ? option.generatorOption
    : path.resolve(option.generatorOption);

  if (await exists(filePath)) {
    const configBuf = await fs.promises.readFile(filePath);
    const config = parse(configBuf.toString()) as Config;
    return { ...config, topRef };
  }

  throw new Error(`cannot found generator option file: ${filePath}`);
}

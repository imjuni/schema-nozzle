import type { TAddSchemaOption } from '#/configs/interfaces/TAddSchemaOption';
import type { TDeleteSchemaOption } from '#/configs/interfaces/TDeleteSchemaOption';
import type { TRefreshSchemaOption } from '#/configs/interfaces/TRefreshSchemaOption';
import fs from 'fs';
import { parse } from 'jsonc-parser';
import { exists } from 'my-node-fp';
import pathe from 'pathe';
import type { Config } from 'ts-json-schema-generator';

const defaultGeneratorOption: Config = {
  minify: false,
  expose: 'export',
  jsDoc: 'extended',
  sortProps: true,
  topRef: false,
  strictTuples: true,
  encodeRefs: false,
  additionalProperties: false,
};

export async function getSchemaGeneratorOption(
  option:
    | Pick<
        TAddSchemaOption,
        '$kind' | 'project' | 'generatorOption' | 'skipError' | 'useDefinitions'
      >
    | Pick<
        TRefreshSchemaOption,
        '$kind' | 'project' | 'generatorOption' | 'skipError' | 'useDefinitions'
      >
    | Pick<
        TDeleteSchemaOption,
        '$kind' | 'project' | 'generatorOption' | 'skipError' | 'useDefinitions'
      >,
): Promise<Config> {
  if (option.generatorOption == null) {
    const generatorOption: Config = {
      ...defaultGeneratorOption,
      topRef: option.useDefinitions,
      tsconfig: option.project,
      skipTypeCheck: option.skipError,
    };

    return generatorOption;
  }

  if (typeof option.generatorOption === 'object') {
    return {
      ...defaultGeneratorOption,
      tsconfig: option.project,
      skipTypeCheck: option.skipError,
      ...option.generatorOption,
      topRef: option.useDefinitions,
    };
  }

  const filePath = pathe.isAbsolute(option.generatorOption)
    ? option.generatorOption
    : pathe.resolve(option.generatorOption);

  if (await exists(filePath)) {
    const configBuf = await fs.promises.readFile(filePath);
    const config = parse(configBuf.toString()) as Config;
    return {
      ...config,
      topRef: option.useDefinitions,
    };
  }

  throw new Error(`cannot found generator option file: ${filePath}`);
}

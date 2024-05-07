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
  options: (
    | Pick<TAddSchemaOption, 'project' | 'skipError' | 'topRef'>
    | Pick<TRefreshSchemaOption, 'project' | 'skipError' | 'topRef'>
    | Pick<TDeleteSchemaOption, 'project' | 'skipError' | 'topRef'>
  ) & { generatorOption?: string | Config },
): Promise<Config> {
  if (options.generatorOption == null) {
    const generatorOption: Config = {
      ...defaultGeneratorOption,
      topRef: false,
      encodeRefs: false,
      tsconfig: options.project,
      skipTypeCheck: options.skipError,
    };

    return generatorOption;
  }

  if (typeof options.generatorOption === 'object') {
    return {
      ...defaultGeneratorOption,
      tsconfig: options.project,
      skipTypeCheck: options.skipError,
      ...options.generatorOption,
      encodeRefs: false,
      topRef: false,
    };
  }

  const filePath = pathe.isAbsolute(options.generatorOption)
    ? options.generatorOption
    : pathe.resolve(options.generatorOption);

  if (await exists(filePath)) {
    const configBuf = await fs.promises.readFile(filePath);
    const config = parse(configBuf.toString()) as Config;

    return {
      ...config,
      encodeRefs: false,
      topRef: false,
    };
  }

  throw new Error(`cannot found generator option file: ${filePath}`);
}

import type { TAddSchemaOption } from '#/configs/interfaces/TAddSchemaOption';
import type { TDeleteSchemaOption } from '#/configs/interfaces/TDeleteSchemaOption';
import type { TRefreshSchemaOption } from '#/configs/interfaces/TRefreshSchemaOption';
import fs from 'fs';
import { parse } from 'jsonc-parser';
import { exists } from 'my-node-fp';
import pathe from 'pathe';
import type { Config } from 'ts-json-schema-generator';
import type { SetRequired } from 'type-fest';

const defaultGeneratorOption: SetRequired<Config, 'encodeRefs'> = {
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
    | Pick<TAddSchemaOption, 'project' | 'skipError'>
    | Pick<TRefreshSchemaOption, 'project' | 'skipError'>
    | Pick<TDeleteSchemaOption, 'project' | 'skipError'>
  ) & { generatorOption?: string | Config },
): Promise<SetRequired<Config, 'encodeRefs'>> {
  if (options.generatorOption == null) {
    const generatorOption: SetRequired<Config, 'encodeRefs'> = {
      ...defaultGeneratorOption,
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
    };
  }

  const filePath = pathe.isAbsolute(options.generatorOption)
    ? options.generatorOption
    : pathe.resolve(options.generatorOption);

  if (await exists(filePath)) {
    const configBuf = await fs.promises.readFile(filePath);
    const config = parse(configBuf.toString()) as Config;
    const encodeRefs = config.encodeRefs ?? defaultGeneratorOption.encodeRefs;

    return {
      ...config,
      encodeRefs,
    };
  }

  throw new Error(`cannot found generator option file: ${filePath}`);
}

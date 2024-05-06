import type { IGenerateOption } from '#/configs/interfaces/IGenerateOption';
import { getRootDirs } from '#/configs/modules/getRootDirs';
import { getSchemaGeneratorOption } from '#/configs/modules/getSchemaGeneratorOption';
import { container } from '#/modules/containers/container';
import { NOZZLE_PACKAGE_JSON_SYMBOL_KEY } from '#/modules/containers/keys';
import { getCwd } from '#/tools/getCwd';
import { orThrow } from 'my-easy-fp';
import type { Config } from 'ts-json-schema-generator';
import type { PackageJson } from 'type-fest';

export async function getGenerateOption(
  option: Omit<Partial<IGenerateOption>, 'generatorOption'> & {
    generatorOption?: string | Config;
    project: string;
  },
): Promise<IGenerateOption> {
  const cwd = getCwd(process.env);
  const packageJson = container.resolve<PackageJson>(NOZZLE_PACKAGE_JSON_SYMBOL_KEY);

  const include = option.include ?? [];
  const exclude = option.exclude ?? [];
  const rootDirs = getRootDirs(cwd, option.rootDirs);
  const topRef = option.topRef ?? false;
  const schemaPath = option.useSchemaPath ?? false;
  const escapeChar = option.escapeChar ?? '_';
  const skipError = option.skipError ?? true;
  const serverUrl =
    option.serverUrl ?? orThrow(packageJson.name, new Error('Cannot found package name'));
  const generatorOption = await getSchemaGeneratorOption({ ...option, topRef, skipError });

  return {
    include,
    exclude,
    rootDirs,
    skipError,
    topRef,
    escapeChar,
    useSchemaPath: schemaPath,
    serverUrl,
    generatorOption,
  };
}

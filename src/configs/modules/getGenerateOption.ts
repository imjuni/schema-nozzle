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
  options: Omit<Partial<IGenerateOption>, 'generatorOption'> & {
    generatorOption?: string | Config;
    project: string;
  },
): Promise<IGenerateOption> {
  const cwd = getCwd(process.env);
  const packageJson = container.resolve<PackageJson>(NOZZLE_PACKAGE_JSON_SYMBOL_KEY);

  const include = options.include ?? [];
  const exclude = options.exclude ?? [];
  const rootDirs = getRootDirs(cwd, options.rootDirs);
  const useSchemaPath = options.useSchemaPath ?? false;
  const jsVar = options.jsVar ?? false;
  const escapeChar = options.escapeChar ?? '_';
  const skipError = options.skipError ?? true;
  const serverUrl =
    options.serverUrl ?? orThrow(packageJson.name, new Error('Cannot found package name'));
  const generatorOption = await getSchemaGeneratorOption({ ...options, skipError });

  return {
    include,
    exclude,
    rootDirs,
    skipError,
    jsVar,
    escapeChar,
    useSchemaPath,
    serverUrl,
    generatorOption,
  };
}

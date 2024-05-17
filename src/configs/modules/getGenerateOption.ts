import type { IGenerateOption } from '#/configs/interfaces/IGenerateOption';
import { getRootDirs } from '#/configs/modules/getRootDirs';
import { getSchemaGeneratorOption } from '#/configs/modules/getSchemaGeneratorOption';
import { getCwd } from '#/tools/getCwd';
import type { Config } from 'ts-json-schema-generator';

export async function getGenerateOption(
  options: Omit<Partial<IGenerateOption>, 'generatorOption'> & {
    generatorOption?: string | Config;
    project: string;
  },
): Promise<IGenerateOption> {
  const cwd = getCwd(process.env);

  const include = options.include ?? [];
  const exclude = options.exclude ?? [];
  const rootDirs = getRootDirs(cwd, options.rootDirs);
  const useSchemaPath = options.useSchemaPath ?? false;
  const jsVar = options.jsVar ?? false;
  const escapeChar = options.escapeChar ?? '_';
  const skipError = options.skipError ?? true;
  const serverUrl = options.serverUrl ?? '';
  const generatorOption = await getSchemaGeneratorOption({ ...options, skipError });
  const originTopRef = generatorOption.topRef ?? false;

  return {
    include,
    exclude,
    rootDirs,
    skipError,
    jsVar,
    escapeChar,
    useSchemaPath,
    originTopRef,
    serverUrl,
    // generator를 생성할 때 전달하는 topRef는 반드시 false로 전달할 것.
    // ts-json-schema-generator 자체 버그를 비롯하여, schema-nozzle도 schema id를 생성할 때
    // definitions를 다룰 수 있으며 topRef를 true로 설정했을 때 만들어지는 $defs를 다룰 수 있는
    // 코드를 아직 작성하지 않아 버그가 발생한다.
    // 아래와 같이 topRef는 false로 전달하고, 대신 사용자가 topRef를 사용을 원할 때를 대비하여
    // originTopRef를 사용해서 원복을 해야 한다
    generatorOption: { ...generatorOption, topRef: false },
  };
}

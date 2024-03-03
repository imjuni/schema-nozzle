import type { TAddSchemaOption } from '#/configs/interfaces/TAddSchemaOption';
import type { TRefreshSchemaOption } from '#/configs/interfaces/TRefreshSchemaOption';
import { NozzleGenerator } from '#/modules/generator/NozzleGenerator';

let it: NozzleGenerator;

let isBootstrap: boolean = false;

export function instance(): Readonly<NozzleGenerator> {
  return it;
}

export function bootstrap(
  options:
    | Pick<TAddSchemaOption, 'project' | 'generatorOptionObject'>
    | Pick<TRefreshSchemaOption, 'project' | 'generatorOptionObject'>,
) {
  if (isBootstrap) {
    return;
  }

  it = new NozzleGenerator({
    ...(options.generatorOptionObject ?? {}),
    tsconfig: options.project,
  });

  isBootstrap = true;
}

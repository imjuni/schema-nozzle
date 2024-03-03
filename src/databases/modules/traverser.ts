import type { TAddSchemaOption } from '#/configs/interfaces/TAddSchemaOption';
import type { TRefreshSchemaOption } from '#/configs/interfaces/TRefreshSchemaOption';
import type { TWatchSchemaOption } from '#/configs/interfaces/TWatchSchemaOption';
import { getSchemaId } from '#/databases/modules/getSchemaId';
import type { AnySchemaObject } from 'ajv';
import { traverse, type TraversalCallback, type TraversalCallbackContext } from 'object-traversal';
import type { getFileImportInfos } from 'ts-morph-short';

export function traverser(
  schema: AnySchemaObject,
  importInfos: ReturnType<typeof getFileImportInfos>,
  option:
    | Pick<TAddSchemaOption, 'rootDir'>
    | Pick<TRefreshSchemaOption, 'rootDir'>
    | Pick<TWatchSchemaOption, 'rootDir'>,
) {
  const traverseHandler: TraversalCallback = (ctx: TraversalCallbackContext): unknown => {
    const next = ctx.parent;

    if (next != null && ctx.key != null && ctx.key === '$ref') {
      const $id = getSchemaId(ctx.value as string, importInfos, option);
      next[ctx.key] = $id;
    }

    return next;
  };

  traverse(schema, traverseHandler);
}

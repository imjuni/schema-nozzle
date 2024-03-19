import type { TAddSchemaOption } from '#/configs/interfaces/TAddSchemaOption';
import type { TDeleteSchemaOption } from '#/configs/interfaces/TDeleteSchemaOption';
import type { TRefreshSchemaOption } from '#/configs/interfaces/TRefreshSchemaOption';
import { getFastifySwaggerId } from '#/databases/modules/getFastifySwaggerId';
import { getSchemaId } from '#/databases/modules/getSchemaId';
import type { AnySchemaObject } from 'ajv';
import { traverse, type TraversalCallback, type TraversalCallbackContext } from 'object-traversal';
import type { getImportInfoMap } from 'ts-morph-short';

export function traverser(
  schema: AnySchemaObject,
  importInfoMap: ReturnType<typeof getImportInfoMap>,
  option:
    | Pick<TAddSchemaOption, 'rootDirs'>
    | Pick<TRefreshSchemaOption, 'rootDirs'>
    | Pick<TDeleteSchemaOption, 'rootDirs'>,
) {
  const traverseHandler: TraversalCallback = (ctx: TraversalCallbackContext): unknown => {
    const next = ctx.parent;

    if (next != null && ctx.key != null && ctx.key === '$ref' && typeof ctx.value === 'string') {
      const $id = getFastifySwaggerId(getSchemaId(ctx.value, importInfoMap, option), option);
      next[ctx.key] = $id;
    }

    return next;
  };

  traverse(schema, traverseHandler);
}

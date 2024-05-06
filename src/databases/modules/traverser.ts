import type { IGenerateOption } from '#/configs/interfaces/IGenerateOption';
import type { CE_SCHEMA_ID_GENERATION_STYLE } from '#/databases/modules/const-enum/CE_SCHEMA_ID_GENERATION_STYLE';
import { replaceId } from '#/databases/modules/replaceId';
import { getSchemaId } from '#/modules/generators/getSchemaId';
import type { AnySchemaObject } from 'ajv';
import { traverse, type TraversalCallback, type TraversalCallbackContext } from 'object-traversal';

type TTraverserParams = AnySchemaObject & {
  $$options: {
    style: CE_SCHEMA_ID_GENERATION_STYLE;
    escapeChar: IGenerateOption['escapeChar'];
    rootDirs: IGenerateOption['rootDirs'];
  };
};

export function traverser(context: TTraverserParams) {
  const traverseHandler: TraversalCallback = (ctx: TraversalCallbackContext): unknown => {
    const next = ctx.parent;

    if (next != null && ctx.key != null && ctx.key === '$ref' && typeof ctx.value === 'string') {
      const $id = getSchemaId({
        typeName: replaceId(ctx.value),
        style: context.$$options.style,
        escapeChar: context.$$options.escapeChar,
        rootDirs: context.$$options.rootDirs,
        isEscape: false,
      });

      next[ctx.key] = $id;
    }

    return next;
  };

  traverse(context, traverseHandler);
}

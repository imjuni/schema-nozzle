import type { IGenerateOption } from '#/configs/interfaces/IGenerateOption';
import type { getKeys } from '#/databases/getKeys';
import type { CE_SCHEMA_ID_GENERATION_STYLE } from '#/databases/modules/const-enum/CE_SCHEMA_ID_GENERATION_STYLE';
import { replaceId } from '#/databases/modules/replaceId';
import { getSchemaId } from '#/modules/generators/getSchemaId';
import type { AnySchemaObject } from 'ajv';
import { traverse, type TraversalCallback, type TraversalCallbackContext } from 'object-traversal';
import type { Config } from 'ts-json-schema-generator';

type TTraverserParams = AnySchemaObject & {
  $$options: {
    keys: ReturnType<typeof getKeys>;
    style: CE_SCHEMA_ID_GENERATION_STYLE;
    escapeChar: IGenerateOption['escapeChar'];
    rootDirs: IGenerateOption['rootDirs'];
    jsVar: IGenerateOption['jsVar'];
    encodeRefs: NonNullable<Config['encodeRefs']>;
  };
};

export function traverser(context: TTraverserParams) {
  const traverseHandler: TraversalCallback = (ctx: TraversalCallbackContext): unknown => {
    const next = ctx.parent;

    if (next != null && ctx.key != null && ctx.key === '$ref' && typeof ctx.value === 'string') {
      const decodedSchemaId = context.$$options.encodeRefs
        ? decodeURIComponent(ctx.value)
        : ctx.value;

      const childId = getSchemaId({
        keys: context.$$options.keys,
        typeName: replaceId(decodedSchemaId),
        style: context.$$options.style,
        escapeChar: context.$$options.escapeChar,
        rootDirs: context.$$options.rootDirs,
        encoding: {
          url: context.$$options.encodeRefs,
          jsVar: context.$$options.jsVar,
        },
      });

      next[ctx.key] = childId;
    }

    return next;
  };

  traverse(context, traverseHandler);
}

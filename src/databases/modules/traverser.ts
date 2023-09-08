import type { JSONSchema7 } from 'json-schema';
import { traverse, type TraversalCallback, type TraversalCallbackContext } from 'object-traversal';
import type TAddSchemaOption from 'src/configs/interfaces/TAddSchemaOption';
import type TRefreshSchemaOption from 'src/configs/interfaces/TRefreshSchemaOption';
import type TWatchSchemaOption from 'src/configs/interfaces/TWatchSchemaOption';
import getSchemaId from 'src/databases/modules/getSchemaId';
import type { getFileImportInfos } from 'ts-morph-short';

export default function traverser(
  schema: JSONSchema7,
  importInfos: ReturnType<typeof getFileImportInfos>,
  option:
    | Pick<TAddSchemaOption, 'rootDir' | 'includePath'>
    | Pick<TRefreshSchemaOption, 'rootDir' | 'includePath'>
    | Pick<TWatchSchemaOption, 'rootDir' | 'includePath'>,
) {
  const traverseHandler: TraversalCallback = (ctx: TraversalCallbackContext): unknown => {
    const next = ctx.parent;

    if (next != null && ctx.key != null && ctx.key === '$ref') {
      const $id = getSchemaId(<string>ctx.value, importInfos, option);
      next[ctx.key] = $id;
    }

    return next;
  };

  traverse(schema, traverseHandler);
}

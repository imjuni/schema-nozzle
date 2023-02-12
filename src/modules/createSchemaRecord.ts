import type getExportedTypes from '#compilers/getExportedTypes';
import type IResolvedPaths from '#configs/interfaces/IResolvedPaths';
import type TAddSchemaOption from '#configs/interfaces/TAddSchemaOption';
import type TRefreshSchemaOption from '#configs/interfaces/TRefreshSchemaOption';
import type createJSONSchema from '#modules/createJSONSchema';
import getFormattedSchema from '#modules/getFormattedSchema';
import type IDatabaseRecord from '#modules/interfaces/IDatabaseRecord';
import type ISchemaExportInfo from '#modules/interfaces/ISchemaExportInfo';
import type ISchemaImportInfo from '#modules/interfaces/ISchemaImportInfo';
import logger from '#tools/logger';
import fastCopy from 'fast-copy';
import type { JSONSchema7 } from 'json-schema';
import { settify } from 'my-easy-fp';
import { getDirname } from 'my-node-fp';
import type { TPickPass } from 'my-only-either';
import { traverse, type TraversalCallback, type TraversalCallbackContext } from 'object-traversal';
import path from 'path';
import type { LastArrayElement } from 'type-fest';

const log = logger();

const traverseHandle: TraversalCallback = ({
  parent,
  key,
  value,
}: TraversalCallbackContext): any => {
  const next = parent;
  if (next != null && key != null && key === '$ref') {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access
    next[key] = `${value.replace('#/definitions/', '')}`;
  }

  return next;
};

type TExportedType = LastArrayElement<ReturnType<typeof getExportedTypes>>;

export default async function createSchemaRecord(
  option:
    | Pick<TAddSchemaOption, 'discriminator' | 'format'>
    | Pick<TRefreshSchemaOption, 'discriminator' | 'format'>,
  resolvedPaths: IResolvedPaths,
  exportedTypes: Pick<TExportedType, 'filePath' | 'identifier'>[],
  schema: TPickPass<ReturnType<typeof createJSONSchema>>,
): Promise<{
  record: IDatabaseRecord;
  definitions?: IDatabaseRecord[];
}> {
  const basePath = await getDirname(resolvedPaths.project);
  const targetSchema = fastCopy(schema.schema);
  const importedMap = exportedTypes.reduce<
    Partial<Record<string, Pick<TExportedType, 'filePath' | 'identifier'>>>
  >((aggregation, exportedType) => {
    return { ...aggregation, [exportedType.identifier]: exportedType };
  }, {});

  traverse(targetSchema, traverseHandle);

  const id = schema.exportedType;
  const stringified = getFormattedSchema(option.format, {
    ...targetSchema,
    definitions: undefined,
  });

  if (schema.schema.definitions == null || Object.values(schema.schema.definitions).length <= 0) {
    const record: IDatabaseRecord = {
      id,
      filePath: path.relative(basePath, schema.filePath),
      dependency: {
        import: { name: id, from: [] },
        export: { name: id, to: [] },
      },
      schema: stringified,
    };

    return { record };
  }

  // extract schema from definitions field
  const definitions = Object.entries(schema.schema.definitions)
    .map(([key, value]) => ({ key, value }))
    .filter(
      (definition): definition is { key: string; value: JSONSchema7 } =>
        typeof definition.value === 'object',
    )
    .map((definition) => {
      const definitionId = definition.key;
      const importDeclaration = importedMap[definition.key];
      const definitionSchema: JSONSchema7 = {
        $schema: schema.schema.$schema,
        $id: definitionId,
        ...definition.value,
      };

      traverse(definitionSchema, traverseHandle);

      log.trace(`ID: ${definitionId}/ ${id}`);

      const definitionStringified = getFormattedSchema(option.format, definitionSchema);
      const exportValue: ISchemaExportInfo = { name: definitionId, to: [id] };

      const definitionRecord: IDatabaseRecord = {
        id: definitionId,
        filePath:
          // slack처럼 외부 모듈을 설치해서 json-schema를 추출하려고 하는 경우,
          // local export map으로 검색할 수 없어 importDeclaration은 undefined 가 된다
          // Target interface, type alias, class from the external module(via npm install) that
          // cannot found import declaration map. Because import declaration map made by local
          // export map.
          importDeclaration != null
            ? path.relative(basePath, importDeclaration.filePath)
            : undefined,
        dependency: {
          import: { name: definitionId, from: [] },
          export: exportValue,
        },
        schema: definitionStringified,
      };

      return definitionRecord;
    });

  const duplicableImportValue: ISchemaImportInfo = definitions
    .map((definition) => definition.id)
    .filter((definition) => id !== definition)
    .map(
      (definition): ISchemaImportInfo => ({
        name: id,
        from: [definition],
      }),
    )
    .reduce(
      (aggregation, importInfo) => {
        return { ...aggregation, from: [...aggregation.from, ...importInfo.from] };
      },
      {
        name: id,
        from: [],
      },
    );

  const importValue: ISchemaImportInfo = {
    ...duplicableImportValue,
    from: settify(duplicableImportValue.from),
  };

  const record: IDatabaseRecord = {
    id,
    filePath: path.relative(basePath, schema.filePath),
    dependency: {
      import: importValue,
      export: { name: id, to: [] },
    },
    schema: stringified,
  };

  return { record, definitions };
}

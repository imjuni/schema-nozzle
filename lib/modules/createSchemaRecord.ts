import IResolvedPaths from '@configs/interfaces/IResolvedPaths';
import createJSONSchema from '@modules/createJSONSchema';
import getImportDeclarationMap from '@modules/getImportDeclaration';
import IDatabaseRecord from '@modules/interfaces/IDatabaseRecord';
import ISchemaExportInfo from '@modules/interfaces/ISchemaExportInfo';
import ISchemaImportInfo from '@modules/interfaces/ISchemaImportInfo';
import fastCopy from 'fast-copy';
import fastSafeStringify from 'fast-safe-stringify';
import { JSONSchema7 } from 'json-schema';
import { settify } from 'my-easy-fp';
import { getDirname } from 'my-node-fp';
import { TPickPass } from 'my-only-either';
import { TraversalCallback, TraversalCallbackContext, traverse } from 'object-traversal';
import path from 'path';
import * as tsm from 'ts-morph';

const traverseHandle: TraversalCallback = ({
  parent,
  key,
  value,
}: TraversalCallbackContext): any => {
  if (parent != null && key != null && key === '$ref') {
    // eslint-disable-next-line no-param-reassign
    parent[key] = `${value.replace('#/definitions/', '')}`;
  }

  return parent;
};

interface ICreateSchemaRecordArgs {
  resolvedPaths: IResolvedPaths;
  project: tsm.Project;
  metadata: TPickPass<ReturnType<typeof createJSONSchema>>;
}

export default async function createSchemaRecord({
  resolvedPaths,
  project,
  metadata,
}: ICreateSchemaRecordArgs): Promise<{
  record: IDatabaseRecord;
  definitions?: IDatabaseRecord[];
}> {
  const basePath = await getDirname(resolvedPaths.project);
  const targetSchema = fastCopy(metadata.schema);
  const importMap = getImportDeclarationMap({ project });

  traverse(targetSchema, traverseHandle);

  const id = metadata.typeName;
  const stringified = fastSafeStringify({ ...targetSchema, definitions: undefined });

  // extract schema from definitions field
  if (metadata.schema.definitions != null) {
    const definitions = Object.entries(metadata.schema.definitions)
      .map(([key, value]) => ({ key, value }))
      .filter(
        (definition): definition is { key: string; value: JSONSchema7 } =>
          typeof definition.value === 'object',
      )
      .map((definition) => {
        const definitionId = definition.key;
        const definitionSchema: JSONSchema7 = {
          $schema: metadata.schema.$schema,
          ...definition.value,
        };

        traverse(definitionSchema, traverseHandle);

        const definitionStringified = fastSafeStringify(definitionSchema);
        const exportValue: ISchemaExportInfo =
          definitionId !== id
            ? {
                name: definitionId,
                to: [id],
              }
            : {
                name: definitionId,
                to: [],
              };

        const importDeclaration = importMap[definitionId];

        if (importDeclaration == null) {
          throw new Error(`Cannot found import name: ${definitionId}`);
        }

        const definitionRecord: IDatabaseRecord = {
          id: definitionId,
          filePath: path.relative(
            basePath,
            importDeclaration.node.getSourceFile().getFilePath().toString(),
          ),
          import: {
            name: definitionId,
            from: [],
          },
          export: exportValue,
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
      filePath: path.relative(basePath, metadata.filePath),
      import: importValue,
      export: {
        name: id,
        to: [],
      },
      schema: stringified,
    };

    return { record, definitions };
  }

  const record: IDatabaseRecord = {
    id,
    filePath: path.relative(basePath, metadata.filePath),
    import: {
      name: id,
      from: [],
    },
    export: {
      name: id,
      to: [],
    },
    schema: stringified,
  };

  return { record };
}

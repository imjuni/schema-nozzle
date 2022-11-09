import IAddSchemaOption from '@configs/interfaces/IAddSchemaOption';
import IRefreshSchemaOption from '@configs/interfaces/IRefreshSchemaOption';
import IResolvedPaths from '@configs/interfaces/IResolvedPaths';
import createJSONSchema from '@modules/createJSONSchema';
import getFormattedSchema from '@modules/getFormattedSchema';
import getImportDeclarationMap from '@modules/getImportDeclaration';
import IDatabaseRecord from '@modules/interfaces/IDatabaseRecord';
import ISchemaExportInfo from '@modules/interfaces/ISchemaExportInfo';
import ISchemaImportInfo from '@modules/interfaces/ISchemaImportInfo';
import { TJSDOC_EXTENDS } from '@modules/interfaces/TJSDOC_EXTENDS';
import fastCopy from 'fast-copy';
import { JSONSchema7 } from 'json-schema';
import { first, settify } from 'my-easy-fp';
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
  const next = parent;
  if (next != null && key != null && key === '$ref') {
    next[key] = `${value.replace('#/definitions/', '')}`;
  }

  return next;
};

function getJsDocTags(
  importMap: ReturnType<typeof getImportDeclarationMap>,
  id: string,
): boolean | string | string[] {
  try {
    const dtos = (importMap[id].node.getSymbol()?.getJsDocTags() ?? [])
      .filter(
        (tag) =>
          tag.getName() === TJSDOC_EXTENDS.AS_DTO || tag.getName() === TJSDOC_EXTENDS.AS_DTO_ALIAS,
      )
      .map((tag) => first(tag.getText()));

    if (dtos == null || dtos.length <= 0) {
      return false;
    }

    const tags = dtos.map((dto) => {
      if (dto.text === 'false' || dto.text === 'true') {
        return Boolean(dto);
      }

      return dto.text;
    });

    if (tags.length === 1 && typeof first(tags) === 'string') {
      return first(tags);
    }

    if (tags.length === 1 && typeof first(tags) === 'boolean') {
      return first(tags);
    }

    return tags.filter((tag): tag is string => typeof tag !== 'boolean');
  } catch {
    return false;
  }
}

interface ICreateSchemaRecordArgs {
  option: IAddSchemaOption | IRefreshSchemaOption;
  resolvedPaths: IResolvedPaths;
  project: tsm.Project;
  metadata: TPickPass<ReturnType<typeof createJSONSchema>>;
}

export default async function createSchemaRecord({
  option,
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
  const stringified = getFormattedSchema(option.format, {
    ...targetSchema,
    definitions: undefined,
  });

  const dtoTag = getJsDocTags(importMap, id);

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
        const importDeclaration = importMap[definition.key];
        const definitionSchema: JSONSchema7 = {
          $schema: metadata.schema.$schema,
          ...definition.value,
        };

        traverse(definitionSchema, traverseHandle);

        const definitionStringified = getFormattedSchema(option.format, definitionSchema);
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

        // definitionId를 사용하는 import를 뒤져서, dto가 있으면 true를 넣어줘야 한다.
        const definitionRecord: IDatabaseRecord = {
          id: definitionId,
          filePath:
            importDeclaration != null
              ? path.relative(
                  basePath,
                  importDeclaration.node.getSourceFile().getFilePath().toString(),
                )
              : undefined,
          import: {
            name: definitionId,
            from: [],
          },
          export: exportValue,
          schema: definitionStringified,
          dto: dtoTag,
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
      dto: dtoTag,
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
    dto: dtoTag,
    schema: stringified,
  };

  return { record };
}

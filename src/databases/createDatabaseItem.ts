import type { getExportedTypes } from '#/compilers/getExportedTypes';
import type { TAddSchemaOption } from '#/configs/interfaces/TAddSchemaOption';
import type { TRefreshSchemaOption } from '#/configs/interfaces/TRefreshSchemaOption';
import type { TWatchSchemaOption } from '#/configs/interfaces/TWatchSchemaOption';
import { getBaseSchemaId } from '#/databases/modules/getBaseSchemaId';
import { getSchemaId } from '#/databases/modules/getSchemaId';
import { traverser } from '#/databases/modules/traverser';
import type { create } from '#/modules/generator/modules/create';
import type { IDatabaseItem } from '#/modules/interfaces/IDatabaseItem';
import type { AnySchemaObject } from 'ajv';
import consola from 'consola';
import fastCopy from 'fast-copy';
import type { TPickPass } from 'my-only-either';
import path from 'path';
import type * as tsm from 'ts-morph';
import { getFileImportInfos } from 'ts-morph-short';
import type { LastArrayElement } from 'type-fest';

type TExportedType = LastArrayElement<ReturnType<typeof getExportedTypes>>;

export function createDatabaseItem(
  project: tsm.Project,
  option:
    | Pick<TAddSchemaOption, '$kind' | 'format' | 'project' | 'projectDir' | 'rootDir'>
    | Pick<TRefreshSchemaOption, '$kind' | 'format' | 'project' | 'projectDir' | 'rootDir'>
    | Pick<TWatchSchemaOption, '$kind' | 'format' | 'project' | 'projectDir' | 'rootDir'>,
  exportedTypes: Pick<TExportedType, 'filePath' | 'identifier'>[],
  schema: TPickPass<ReturnType<typeof create>>,
): {
  item: IDatabaseItem;
  definitions?: IDatabaseItem[];
} {
  const basePath = option.projectDir;
  const targetSchema = fastCopy(schema.schema);
  const importInfos = getFileImportInfos(project, schema.filePath);
  const importedMap = exportedTypes.reduce<
    Partial<Record<string, Pick<TExportedType, 'filePath' | 'identifier'>>>
  >((aggregation, exportedType) => {
    return { ...aggregation, [exportedType.identifier]: exportedType };
  }, {});

  targetSchema.$id = getSchemaId(schema.exportedType, importInfos, option);
  traverser(targetSchema, importInfos, option);

  const id = getBaseSchemaId(schema.exportedType, schema.filePath, option);

  if (schema.schema.definitions == null || Object.values(schema.schema.definitions).length <= 0) {
    const record: IDatabaseItem = {
      id,
      filePath: path.relative(basePath, schema.filePath),
      $ref: [],
      schema: targetSchema,
    };

    return { item: record };
  }

  // extract schema from definitions field
  const definitions = Object.entries(schema.schema.definitions)
    .map(([key, value]) => ({ key, value }))
    .filter(
      (definition): definition is { key: string; value: AnySchemaObject } =>
        typeof definition.value === 'object',
    )
    .map((definition) => {
      const definitionId = getSchemaId(definition.key, importInfos, option);
      const importDeclaration = importedMap[definition.key];
      const definitionSchema: AnySchemaObject = {
        $schema: schema.schema.$schema,
        $id: definitionId,
        ...definition.value,
      };

      traverser(definitionSchema, importInfos, option);

      consola.trace(`ID: ${definitionId}/ ${id}`);

      const definitionStringified = definitionSchema;
      // const exportValue: ISchemaExportInfo = { name: definitionId, to: [id] };

      const definitionRecord: IDatabaseItem = {
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
        $ref: [],
        schema: definitionStringified,
      };

      return definitionRecord;
    });

  const record: IDatabaseItem = {
    id,
    filePath: path.relative(basePath, schema.filePath),
    $ref: definitions.map((definition) => definition.id),
    schema: targetSchema,
  };

  return { item: record, definitions };
}

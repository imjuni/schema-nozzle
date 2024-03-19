import type { getExportedTypes } from '#/compilers/getExportedTypes';
import type { TAddSchemaOption } from '#/configs/interfaces/TAddSchemaOption';
import type { TDeleteSchemaOption } from '#/configs/interfaces/TDeleteSchemaOption';
import type { TRefreshSchemaOption } from '#/configs/interfaces/TRefreshSchemaOption';
import { getBaseSchemaId } from '#/databases/modules/getBaseSchemaId';
import { getFastifySwaggerId } from '#/databases/modules/getFastifySwaggerId';
import { getSchemaId } from '#/databases/modules/getSchemaId';
import { traverser } from '#/databases/modules/traverser';
import type { createJsonSchema } from '#/modules/generator/modules/createJsonSchema';
import type { IDatabaseItem } from '#/modules/interfaces/IDatabaseItem';
import type { AnySchemaObject } from 'ajv';
import consola from 'consola';
import fastCopy from 'fast-copy';
import type { TPickPass } from 'my-only-either';
import path from 'node:path';
import type { getImportInfoMap } from 'ts-morph-short';
import type { LastArrayElement } from 'type-fest';

type TExportedType = LastArrayElement<ReturnType<typeof getExportedTypes>>;

export function createDatabaseItem(
  option:
    | Pick<TAddSchemaOption, '$kind' | 'project' | 'projectDir' | 'rootDirs'>
    | Pick<TRefreshSchemaOption, '$kind' | 'project' | 'projectDir' | 'rootDirs'>
    | Pick<TDeleteSchemaOption, '$kind' | 'project' | 'projectDir' | 'rootDirs'>,
  exportedTypes: Pick<TExportedType, 'filePath' | 'identifier'>[],
  schema: TPickPass<ReturnType<typeof createJsonSchema>>,
  importInfoMap: ReturnType<typeof getImportInfoMap>,
): {
  item: IDatabaseItem;
  definitions?: IDatabaseItem[];
} {
  const basePath = option.projectDir;
  const currentSchema = fastCopy(schema.schema);
  const importedMap = exportedTypes.reduce<
    Partial<Record<string, Pick<TExportedType, 'filePath' | 'identifier'>>>
  >((aggregation, exportedType) => {
    return { ...aggregation, [exportedType.identifier]: exportedType };
  }, {});

  currentSchema.$id = getFastifySwaggerId(
    getBaseSchemaId(schema.exportedType, schema.filePath, option),
    option,
  );
  currentSchema.title = getBaseSchemaId(schema.exportedType, schema.filePath, option, false);
  traverser({ ...currentSchema, $$filePath: schema.filePath }, importInfoMap, option);

  const id = currentSchema.$id;

  if (schema.schema.definitions == null || Object.values(schema.schema.definitions).length <= 0) {
    const item: IDatabaseItem = {
      id,
      typeName: schema.exportedType,
      filePath: path.relative(basePath, schema.filePath),
      $ref: [],
      schema: currentSchema,
      rawSchema: JSON.stringify(currentSchema),
    };

    return { item };
  }

  // extract schema from definitions field
  const definitions = Object.entries(schema.schema.definitions)
    .map(([key, value]) => ({ key, value }))
    .filter(
      (definition): definition is { key: string; value: AnySchemaObject } =>
        typeof definition.value === 'object',
    )
    .map((definition) => {
      const definitionId = getFastifySwaggerId(
        getSchemaId(definition.key, importInfoMap, option),
        option,
      );
      const title = getSchemaId(definition.key, importInfoMap, option, false);
      const importDeclaration = importedMap[definition.key];
      const definitionSchema: AnySchemaObject = {
        $schema: schema.schema.$schema,
        $id: definitionId,
        title,
        ...definition.value,
      };

      traverser({ ...definitionSchema, $$filePath: schema.filePath }, importInfoMap, option);

      consola.trace(`ID: ${definitionId}/ ${id}`);

      const definitionStringified = definitionSchema;
      // const exportValue: ISchemaExportInfo = { name: definitionId, to: [id] };

      delete definitionStringified.definitions;
      const definitionRecord: IDatabaseItem = {
        id: definitionId,
        typeName: definition.key,
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
        rawSchema: JSON.stringify(definitionStringified),
      };

      return definitionRecord;
    });

  delete currentSchema.definitions;
  const item: IDatabaseItem = {
    id,
    typeName: schema.exportedType,
    filePath: path.relative(basePath, schema.filePath),
    $ref: definitions.map((definition) => definition.id),
    schema: currentSchema,
    rawSchema: JSON.stringify(currentSchema),
  };

  return { item, definitions };
}

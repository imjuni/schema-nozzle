import type { IGenerateOption } from '#/configs/interfaces/IGenerateOption';
import type { ISchemaRecord } from '#/databases/interfaces/ISchemaRecord';
import type { ISchemaRefRecord } from '#/databases/interfaces/ISchemaRefRecord';
import type { CE_SCHEMA_ID_GENERATION_STYLE } from '#/databases/modules/const-enum/CE_SCHEMA_ID_GENERATION_STYLE';
import { replaceId } from '#/databases/modules/replaceId';
import { traverser } from '#/databases/modules/traverser';
import { container } from '#/modules/containers/container';
import { STATEMENT_IMPORT_MAP_SYMBOL_KEY } from '#/modules/containers/keys';
import type { createJsonSchema } from '#/modules/generators/createJsonSchema';
import { getGenericType } from '#/modules/generators/getGenericType';
import { getSchemaId } from '#/modules/generators/getSchemaId';
import { getRelativePathByRootDirs } from '#/modules/paths/getRelativePathByRootDirs';
import type { AnySchemaObject } from 'ajv';
import consola from 'consola';
import fastCopy from 'fast-copy';
import type { TPickPass } from 'my-only-either';
import type { getImportInfoMap } from 'ts-morph-short';

interface ICreateSchemaRecordParams {
  escapeChar: IGenerateOption['escapeChar'];
  rootDirs: IGenerateOption['rootDirs'];
  schema: TPickPass<ReturnType<typeof createJsonSchema>>;
  style: CE_SCHEMA_ID_GENERATION_STYLE;
}

export function createRecord({ escapeChar, rootDirs, schema, style }: ICreateSchemaRecordParams): {
  schemas: ISchemaRecord[];
  refs: ISchemaRefRecord[];
} {
  const currentSchema = fastCopy(schema.schema);
  const importInfoMap = container.resolve<ReturnType<typeof getImportInfoMap>>(
    STATEMENT_IMPORT_MAP_SYMBOL_KEY,
  );

  currentSchema.$id = getSchemaId({
    typeName: schema.exportedType,
    filePath: schema.filePath,
    isEscape: false,
    escapeChar,
    rootDirs,
    style,
  });
  currentSchema.title = currentSchema.$id;

  traverser({ ...currentSchema, $$options: { style, escapeChar, rootDirs } });

  const id = currentSchema.$id;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  if (schema.schema.definitions == null || Object.values(schema.schema.definitions).length <= 0) {
    const schemas: ISchemaRecord = {
      id,
      typeName: schema.exportedType,
      filePath: schema.filePath,
      relativePath: getRelativePathByRootDirs(rootDirs, schema.filePath),
      schema: currentSchema,
    };

    return { schemas: [schemas], refs: [] };
  }

  // extract schema from definitions field
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const definitions = Object.entries(schema.schema.definitions)
    .map(([key, value]) => ({ key, value }))
    .filter(
      (definition): definition is { key: string; value: AnySchemaObject } =>
        typeof definition.value === 'object',
    )
    .map((definition) => {
      const keyInfo = { key: definition.key, replaced: replaceId(definition.key) };
      const genericInfo = getGenericType(keyInfo.replaced);

      const definitionId = getSchemaId({
        typeName: keyInfo.replaced,
        isEscape: false,
        escapeChar,
        rootDirs,
        style,
      });
      const title = keyInfo.replaced;
      const importDeclaration = importInfoMap.get(genericInfo.name);
      const definitionSchema: AnySchemaObject = {
        $schema: schema.schema.$schema,
        $id: definitionId,
        title,
        ...definition.value,
      };

      traverser({ ...definitionSchema, $$options: { style, escapeChar, rootDirs } });

      consola.trace(`ID: ${definitionId}/ ${id}`);

      const definitionStringified = definitionSchema;

      delete definitionStringified.definitions;

      const definitionRecord: ISchemaRecord = {
        id: definitionId,
        typeName: definition.key,
        filePath:
          // slack처럼 외부 모듈을 설치해서 json-schema를 추출하려고 하는 경우,
          // local export map으로 검색할 수 없어 importDeclaration은 undefined 가 된다
          // Target interface, type alias, class from the external module(via npm install) that
          // cannot found import declaration map. Because import declaration map made by local
          // export map.
          importDeclaration != null && importDeclaration.moduleFilePath != null
            ? getRelativePathByRootDirs(rootDirs, importDeclaration.moduleFilePath)
            : undefined,
        schema: definitionStringified,
      };

      return definitionRecord;
    });

  delete currentSchema.definitions;
  const schemas: ISchemaRecord = {
    id,
    typeName: schema.exportedType,
    filePath: getRelativePathByRootDirs(rootDirs, schema.filePath),
    schema: currentSchema,
  };

  const refs = definitions.map((definition) => {
    const ref: ISchemaRefRecord = { id, refId: definition.id };
    return ref;
  });

  return { schemas: [schemas, ...definitions], refs };
}

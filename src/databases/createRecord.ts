import type { IGenerateOption } from '#/configs/interfaces/IGenerateOption';
import type { ISchemaRecord } from '#/databases/interfaces/ISchemaRecord';
import type { ISchemaRefRecord } from '#/databases/interfaces/ISchemaRefRecord';
import type { CE_SCHEMA_ID_GENERATION_STYLE } from '#/databases/modules/const-enum/CE_SCHEMA_ID_GENERATION_STYLE';
import { replaceId } from '#/databases/modules/replaceId';
import { traverser } from '#/databases/modules/traverser';
import type { createJsonSchema } from '#/modules/generators/createJsonSchema';
import { getGenericType } from '#/modules/generators/getGenericType';
import { getImportInfo } from '#/modules/generators/getImportInfo';
import { getIsExternal } from '#/modules/generators/getIsExternal';
import { getSchemaId } from '#/modules/generators/getSchemaId';
import { getRelativePathByRootDirs } from '#/modules/paths/getRelativePathByRootDirs';
import { getSchemaFilePath } from '#/modules/paths/getSchemaFilePath';
import { getSchemaRelativePath } from '#/modules/paths/getSchemaRelativePath';
import type { AnySchemaObject } from 'ajv';
import consola from 'consola';
import fastCopy from 'fast-copy';
import { getDirnameSync } from 'my-node-fp';
import type { TPickPass } from 'my-only-either';
import type { Config } from 'ts-json-schema-generator';

interface ICreateSchemaRecordParams {
  escapeChar: IGenerateOption['escapeChar'];
  rootDirs: IGenerateOption['rootDirs'];
  schema: TPickPass<ReturnType<typeof createJsonSchema>>;
  style: CE_SCHEMA_ID_GENERATION_STYLE;
  encodeRefs: NonNullable<Config['encodeRefs']>;
  jsVar: IGenerateOption['jsVar'];
}

export function createRecord({
  escapeChar,
  rootDirs,
  schema,
  style,
  jsVar,
  encodeRefs,
}: ICreateSchemaRecordParams): {
  schemas: ISchemaRecord[];
  refs: ISchemaRefRecord[];
} {
  const currentSchema = fastCopy(schema.schema);

  currentSchema.$id = getSchemaId({
    typeName: schema.exportedType,
    filePath: schema.filePath,
    escapeChar,
    rootDirs,
    style,
    encoding: { url: encodeRefs, jsVar },
  });

  currentSchema.title = currentSchema.$id;

  consola.verbose(
    `ID[{encodeRefs: ${encodeRefs}, jsVar: ${jsVar}}]: ${currentSchema.$id}/ ${currentSchema.$id}`,
  );

  traverser({ ...currentSchema, $$options: { style, escapeChar, rootDirs, jsVar, encodeRefs } });

  const id = currentSchema.$id;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  if (schema.schema.definitions == null || Object.values(schema.schema.definitions).length <= 0) {
    const schemas: ISchemaRecord = {
      id,
      typeName: schema.exportedType,
      filePath: schema.filePath,
      relativePath: getRelativePathByRootDirs(
        rootDirs,
        schema.exportedType,
        getDirnameSync(schema.filePath),
      ),
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
        encoding: { url: encodeRefs, jsVar },
        escapeChar,
        rootDirs,
        style,
      });
      const title = keyInfo.replaced;
      const importInfo = getImportInfo(genericInfo.name);
      const isExternal = getIsExternal(importInfo);

      const definitionSchema: AnySchemaObject = {
        $schema: schema.schema.$schema,
        $id: definitionId,
        title,
        ...definition.value,
      };

      traverser({
        ...definitionSchema,
        $$options: { style, escapeChar, rootDirs, jsVar, encodeRefs },
      });

      consola.verbose(`ID[{encodeRefs: ${encodeRefs}, jsVar: ${jsVar}}]: ${definitionId}/ ${id}`);

      const definitionStringified = definitionSchema;

      delete definitionStringified.definitions;

      const definitionRecord: ISchemaRecord = {
        id: definitionId,
        typeName: definition.key,
        // slack처럼 외부 모듈을 설치해서 json-schema를 추출하려고 하는 경우,
        // local export map으로 검색할 수 없어 importDeclaration은 undefined 가 된다
        // Target interface, type alias, class from the external module(via npm install) that
        // cannot found import declaration map. Because import declaration map made by local
        // export map.
        filePath: getSchemaFilePath({ isExternal, typeName: definition.key, importInfo }),
        relativePath: getSchemaRelativePath({
          isExternal,
          typeName: definition.key,
          rootDirs,
          importInfo,
        }),
        schema: definitionStringified,
      };

      return definitionRecord;
    });

  delete currentSchema.definitions;
  const schemas: ISchemaRecord = {
    id,
    typeName: schema.exportedType,
    filePath: schema.filePath,
    relativePath: getRelativePathByRootDirs(
      rootDirs,
      schema.exportedType,
      getDirnameSync(schema.filePath),
    ),
    schema: currentSchema,
  };

  const refs = definitions.map((definition) => {
    const ref: ISchemaRefRecord = { id, refId: definition.id };
    return ref;
  });

  return { schemas: [schemas, ...definitions], refs };
}

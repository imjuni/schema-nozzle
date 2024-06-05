import type { IGenerateOption } from '#/configs/interfaces/IGenerateOption';
import { getKeys } from '#/databases/getKeys';
import type { ISchemaRecord } from '#/databases/interfaces/ISchemaRecord';
import type { ISchemaRefRecord } from '#/databases/interfaces/ISchemaRefRecord';
import type { CE_SCHEMA_ID_GENERATION_STYLE } from '#/databases/modules/const-enum/CE_SCHEMA_ID_GENERATION_STYLE';
import { getDefs } from '#/databases/modules/getDefs';
import { replaceId } from '#/databases/modules/replaceId';
import { traverser } from '#/databases/modules/traverser';
import { replaceDraft } from '#/databases/replaceDraft';
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
  draft: IGenerateOption['draft'];
  escapeChar: IGenerateOption['escapeChar'];
  rootDirs: IGenerateOption['rootDirs'];
  schema: TPickPass<ReturnType<typeof createJsonSchema>>;
  style: CE_SCHEMA_ID_GENERATION_STYLE;
  encodeRefs: NonNullable<Config['encodeRefs']>;
  jsVar: IGenerateOption['jsVar'];
}

export function createRecord({
  draft,
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
  const keys = getKeys(draft);
  const currentSchema = fastCopy(schema.schema);
  const parentId = getSchemaId({
    keys,
    typeName: schema.exportedType,
    filePath: schema.filePath,
    escapeChar,
    rootDirs,
    style,
    encoding: { url: encodeRefs, jsVar },
  });

  currentSchema[keys.id] = parentId;
  currentSchema.title = parentId;

  consola.verbose(
    `ID[{encodeRefs: ${encodeRefs}, jsVar: ${jsVar}}]: ${currentSchema.$id}/ ${currentSchema.$id}`,
  );

  traverser({
    ...currentSchema,
    $$options: { keys, style, escapeChar, rootDirs, jsVar, encodeRefs },
  });

  const id = parentId;
  const defs = getDefs(schema.schema);

  if (defs == null) {
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
  const definitions = defs.map((definition) => {
    const keyInfo = { key: definition.key, replaced: replaceId(definition.key) };
    const genericInfo = getGenericType(keyInfo.replaced);

    const definitionId = getSchemaId({
      keys,
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
      title,
      ...definition.value,
    };

    definitionSchema[keys.id] = definitionId;

    traverser({
      ...definitionSchema,
      $$options: { keys, style, escapeChar, rootDirs, jsVar, encodeRefs },
    });

    consola.verbose(`ID[{encodeRefs: ${encodeRefs}, jsVar: ${jsVar}}]: ${definitionId}/ ${id}`);

    // draft 1 ~ 7
    delete definitionSchema.definitions;
    // draft 8
    delete definitionSchema.$defs;

    definitionSchema.$schema =
      definitionSchema.$schema != null ? replaceDraft(definitionSchema.$schema, draft) : undefined;

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
      schema: definitionSchema,
    };

    return definitionRecord;
  });

  // draft 1 ~ 7
  delete currentSchema.definitions;
  // draft 8
  delete currentSchema.$defs;

  currentSchema.$schema =
    currentSchema.$schema != null ? replaceDraft(currentSchema.$schema, draft) : undefined;

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

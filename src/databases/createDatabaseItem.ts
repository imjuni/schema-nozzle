import fastCopy from 'fast-copy';
import type { JSONSchema7 } from 'json-schema';
import { settify } from 'my-easy-fp';
import { getDirnameSync } from 'my-node-fp';
import type { TPickPass } from 'my-only-either';
import path from 'path';
import type getExportedTypes from 'src/compilers/getExportedTypes';
import type TAddSchemaOption from 'src/configs/interfaces/TAddSchemaOption';
import type TRefreshSchemaOption from 'src/configs/interfaces/TRefreshSchemaOption';
import type TWatchSchemaOption from 'src/configs/interfaces/TWatchSchemaOption';
import getBaseSchemaId from 'src/databases/modules/getBaseSchemaId';
import getSchemaId from 'src/databases/modules/getSchemaId';
import traverser from 'src/databases/modules/traverser';
import type createJSONSchema from 'src/modules/createJSONSchema';
import getFormattedSchema from 'src/modules/getFormattedSchema';
import type IDatabaseItem from 'src/modules/interfaces/IDatabaseItem';
import type ISchemaExportInfo from 'src/modules/interfaces/ISchemaExportInfo';
import type ISchemaImportInfo from 'src/modules/interfaces/ISchemaImportInfo';
import logger from 'src/tools/logger';
import type { Project } from 'ts-morph';
import { getFileImportInfos } from 'ts-morph-short';
import type { LastArrayElement } from 'type-fest';

const log = logger();

type TExportedType = LastArrayElement<ReturnType<typeof getExportedTypes>>;

export default function createDatabaseItem(
  project: Project,
  option:
    | Pick<TAddSchemaOption, 'discriminator' | 'format' | 'project' | 'rootDir' | 'includePath'>
    | Pick<TRefreshSchemaOption, 'discriminator' | 'format' | 'project' | 'rootDir' | 'includePath'>
    | Pick<TWatchSchemaOption, 'discriminator' | 'format' | 'project' | 'rootDir' | 'includePath'>,
  exportedTypes: Pick<TExportedType, 'filePath' | 'identifier'>[],
  schema: TPickPass<ReturnType<typeof createJSONSchema>>,
): {
  item: IDatabaseItem;
  definitions?: IDatabaseItem[];
} {
  const basePath = getDirnameSync(option.project);
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
  const stringified = getFormattedSchema(option.format, {
    ...targetSchema,
    definitions: undefined,
  });

  if (schema.schema.definitions == null || Object.values(schema.schema.definitions).length <= 0) {
    const record: IDatabaseItem = {
      id,
      filePath: path.relative(basePath, schema.filePath),
      dependency: {
        import: { name: id, from: [] },
        export: { name: id, to: [] },
      },
      schema: stringified,
    };

    return { item: record };
  }

  // extract schema from definitions field
  const definitions = Object.entries(schema.schema.definitions)
    .map(([key, value]) => ({ key, value }))
    .filter(
      (definition): definition is { key: string; value: JSONSchema7 } =>
        typeof definition.value === 'object',
    )
    .map((definition) => {
      const definitionId = getSchemaId(definition.key, importInfos, option);
      const importDeclaration = importedMap[definition.key];
      const definitionSchema: JSONSchema7 = {
        $schema: schema.schema.$schema,
        $id: definitionId,
        ...definition.value,
      };

      traverser(definitionSchema, importInfos, option);

      log.trace(`ID: ${definitionId}/ ${id}`);

      const definitionStringified = getFormattedSchema(option.format, definitionSchema);
      const exportValue: ISchemaExportInfo = { name: definitionId, to: [id] };

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

  const record: IDatabaseItem = {
    id,
    filePath: path.relative(basePath, schema.filePath),
    dependency: {
      import: importValue,
      export: { name: id, to: [] },
    },
    schema: stringified,
  };

  return { item: record, definitions };
}

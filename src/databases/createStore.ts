/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { CE_SCHEMA_ID_GENERATION_STYLE } from '#/databases/modules/const-enum/CE_SCHEMA_ID_GENERATION_STYLE';
import type { SchemaRepository } from '#/databases/repository/schemas/SchemaRepository';
import { container } from '#/modules/containers/container';
import { REPOSITORY_SCHEMAS_SYMBOL_KEY } from '#/modules/containers/keys';
import type { AnySchemaObject, SchemaObject } from 'ajv';
import { set } from 'dot-prop';
import fastCopy from 'fast-copy';
import path from 'path/posix';

export async function createStore(serverUrl: string, style: CE_SCHEMA_ID_GENERATION_STYLE) {
  const schemaRepo = container.resolve<SchemaRepository>(REPOSITORY_SCHEMAS_SYMBOL_KEY);
  const tables = await schemaRepo.tables();

  if (style === CE_SCHEMA_ID_GENERATION_STYLE.DEFINITIONS_WITH_PATH) {
    const store = tables.reduce<SchemaObject>(
      (aggregation, record) => {
        const schema = fastCopy(record.schema);
        schema.id = undefined;
        schema.$id = undefined;
        const { $defs } = aggregation;

        if ($defs == null || record.relativePath == null) {
          return aggregation;
        }

        const storePath = record.relativePath.replace(new RegExp(path.sep, 'g'), '.');

        set($defs, storePath, schema);

        return { ...aggregation, $defs };
      },
      {
        $id: serverUrl,
        $defs: {},
      },
    );

    return { style, store };
  }

  if (style === CE_SCHEMA_ID_GENERATION_STYLE.DEFINITIONS) {
    const store = tables.reduce<SchemaObject>(
      (aggregation, record) => {
        const schema = fastCopy(record.schema);
        schema.id = undefined;
        schema.$id = undefined;
        const { $defs } = aggregation;

        if ($defs == null || record.relativePath == null) {
          return aggregation;
        }

        set($defs, record.typeName, schema);

        return { ...aggregation, $defs };
      },
      {
        $id: serverUrl,
        $defs: {},
      },
    );

    return { style, store };
  }

  if (style === CE_SCHEMA_ID_GENERATION_STYLE.ID_WITH_PATH) {
    const store = tables.reduce<Record<string, AnySchemaObject>>((aggregation, record) => {
      const { relativePath } = record;

      if (relativePath == null) {
        return aggregation;
      }

      const schema = fastCopy(record.schema);
      schema.id = undefined;

      return { ...aggregation, [relativePath]: schema };
    }, {});

    return { style, store };
  }

  // CE_SCHEMA_ID_GENERATION_STYLE.ID
  const store = tables.reduce<Record<string, AnySchemaObject>>((json, record) => {
    const schema = fastCopy(record.schema);
    schema.id = undefined;

    return { ...json, [record.typeName]: schema };
  }, {});

  return { style: CE_SCHEMA_ID_GENERATION_STYLE.ID, store };
}

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { IGenerateOption } from '#/configs/interfaces/IGenerateOption';
import { getKeys } from '#/databases/getKeys';
import { CE_SCHEMA_ID_GENERATION_STYLE } from '#/databases/modules/const-enum/CE_SCHEMA_ID_GENERATION_STYLE';
import type { SchemaRepository } from '#/databases/repository/schemas/SchemaRepository';
import { container } from '#/modules/containers/container';
import { REPOSITORY_SCHEMAS_SYMBOL_KEY } from '#/modules/containers/keys';
import type { AnySchemaObject, SchemaObject } from 'ajv';
import { set } from 'dot-prop';
import fastCopy from 'fast-copy';
import path from 'path/posix';

interface ICreateStoreProps {
  draft: IGenerateOption['draft'];
  serverUrl: string;
  style: CE_SCHEMA_ID_GENERATION_STYLE;
}

export async function createStore({ draft, serverUrl, style }: ICreateStoreProps) {
  const schemaRepo = container.resolve<SchemaRepository>(REPOSITORY_SCHEMAS_SYMBOL_KEY);
  const tables = await schemaRepo.tables();
  const keys = getKeys(draft);

  if (style === CE_SCHEMA_ID_GENERATION_STYLE.DEFINITIONS_WITH_PATH) {
    const store = tables.reduce<SchemaObject>(
      (aggregation, record) => {
        const schema = fastCopy(record.schema);
        delete schema.$id;
        delete schema.id;

        const $defs = aggregation[keys.def];

        if ($defs == null || record.relativePath == null) {
          return aggregation;
        }

        const storePath = record.relativePath.replace(new RegExp(path.sep, 'g'), '.');

        set($defs, storePath, schema);

        return { ...aggregation, [keys.def]: $defs };
      },
      {
        [keys.id]: serverUrl,
        [keys.def]: {},
      },
    );

    if (store.$id == null || store.$id === '') {
      delete store.$id;
    }

    return { style, store };
  }

  if (style === CE_SCHEMA_ID_GENERATION_STYLE.DEFINITIONS) {
    const store = tables.reduce<SchemaObject>(
      (aggregation, record) => {
        const schema = fastCopy(record.schema);
        delete schema.$id;
        delete schema.id;

        const $defs = aggregation[keys.def];

        if ($defs == null || record.relativePath == null) {
          return aggregation;
        }

        set($defs, record.typeName, schema);

        return { ...aggregation, [keys.def]: $defs };
      },
      {
        [keys.id]: serverUrl,
        [keys.def]: {},
      },
    );

    if (store.$id == null || store.$id === '') {
      delete store.$id;
    }

    return { style, store };
  }

  if (style === CE_SCHEMA_ID_GENERATION_STYLE.ID_WITH_PATH) {
    const store = tables.reduce<Record<string, AnySchemaObject>>((aggregation, record) => {
      const { relativePath } = record;

      if (relativePath == null) {
        return aggregation;
      }

      const schema = fastCopy(record.schema);

      return { ...aggregation, [relativePath]: schema };
    }, {});

    return { style, store };
  }

  // CE_SCHEMA_ID_GENERATION_STYLE.ID
  const store = tables.reduce<Record<string, AnySchemaObject>>((json, record) => {
    const schema = fastCopy(record.schema);

    return { ...json, [record.id]: schema };
  }, {});

  return { style: CE_SCHEMA_ID_GENERATION_STYLE.ID, store };
}

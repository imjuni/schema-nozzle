import IDatabaseRecord from '@modules/interfaces/IDatabaseRecord';
import { TDatabase } from '@modules/interfaces/TDatabase';
import fastCopy from 'fast-copy';
import { settify } from 'my-easy-fp';
import { LastArrayElement } from 'type-fest';

export default function mergeSchemaRecord(db: TDatabase, schema: IDatabaseRecord): IDatabaseRecord {
  const prevSchema = db[schema.id];

  if (prevSchema == null) {
    return schema;
  }

  const prevSchemaNames = prevSchema.import.map((importSchema) => importSchema.name);
  const nextSchemaNames = schema.import.map((importSchema) => importSchema.name);

  const deleteSchemaNames = prevSchemaNames.filter(
    (name) => nextSchemaNames.includes(name) === false,
  );
  // const updateSchemaNames = prevSchemaNames.filter((name) => nextSchemaNames.includes(name));
  // const addSchemaNames = nextSchemaNames.filter((name) => prevSchemaNames.includes(name) === false);

  const newSchema = fastCopy(schema);
  const newSchemaImport = Object.values(
    [...newSchema.import, ...prevSchema.import].reduce<
      Record<string, LastArrayElement<IDatabaseRecord['import']>>
    >((aggregation, importItem) => {
      if (
        aggregation[importItem.name] == null &&
        deleteSchemaNames.includes(importItem.name) !== false
      ) {
        return { ...aggregation, [importItem.name]: importItem };
      }

      if (deleteSchemaNames.includes(importItem.name) !== false) {
        const newFrom = settify([...aggregation[importItem.name].from, ...importItem.from]);
        return { ...aggregation, [importItem.name]: { ...importItem, from: newFrom } };
      }

      return aggregation;
    }, {}),
  );

  newSchema.import = newSchemaImport;

  return newSchema;
}

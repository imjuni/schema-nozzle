import IDatabaseRecord from '@modules/interfaces/IDatabaseRecord';
import { TDatabase } from '@modules/interfaces/TDatabase';
import fastCopy from 'fast-copy';
import { settify } from 'my-easy-fp';

export default function mergeSchemaRecord(db: TDatabase, schema: IDatabaseRecord): IDatabaseRecord {
  const prevSchema = db[schema.id];

  if (prevSchema == null) {
    return schema;
  }

  const newSchema = fastCopy(schema);

  const newImports: IDatabaseRecord['import'] = {
    name: newSchema.import.name,
    from: settify([...prevSchema.import.from, ...newSchema.import.from]),
  };

  newSchema.import = newImports;

  const newExports: IDatabaseRecord['export'] = {
    name: newSchema.export.name,
    to: settify([...prevSchema.export.to, ...newSchema.export.to]),
  };

  newSchema.export = newExports;

  return newSchema;
}

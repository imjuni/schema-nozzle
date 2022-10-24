import createJSONSchema from '@modules/createJSONSchema';
import IDatabaseRecord from '@modules/interfaces/IDatabaseRecord';
import ISchemaExportInfo from '@modules/interfaces/ISchemaExportInfo';
import ISchemaImportInfo from '@modules/interfaces/ISchemaImportInfo';
import fastCopy from 'fast-copy';
import fastSafeStringify from 'fast-safe-stringify';
import { JSONSchema7 } from 'json-schema';
import { TPickPass } from 'my-only-either';
import { TraversalCallback, TraversalCallbackContext, traverse } from 'object-traversal';

const traverseHandle: TraversalCallback = ({
  parent,
  key,
  value,
}: TraversalCallbackContext): any => {
  if (parent != null && key != null && key === '$ref') {
    // eslint-disable-next-line no-param-reassign
    parent[key] = `${value.replace('#/definitions/', '')}`;
  }

  return parent;
};

interface ICreateSchemaRecordArgs {
  schemaMetadata: TPickPass<ReturnType<typeof createJSONSchema>>;
}

export default function createSchemaRecord({ schemaMetadata }: ICreateSchemaRecordArgs): {
  record: IDatabaseRecord;
  definitions?: IDatabaseRecord[];
} {
  const targetSchema = fastCopy(schemaMetadata.schema);
  traverse(targetSchema, traverseHandle);

  const id = schemaMetadata.typeName;
  const stringified = fastSafeStringify({ ...targetSchema, definitions: undefined });

  // definitions에 있는 것을 추출
  if (schemaMetadata.schema.definitions != null) {
    const definitions = Object.entries(schemaMetadata.schema.definitions)
      .map(([key, value]) => ({ key, value }))
      .filter(
        (definition): definition is { key: string; value: JSONSchema7 } =>
          typeof definition.value === 'object',
      )
      .map((definition) => {
        const definitionId = definition.key;
        const definitionSchema: JSONSchema7 = {
          $schema: schemaMetadata.schema.$schema,
          ...definition.value,
        };

        traverse(definitionSchema, traverseHandle);

        const definitionStringified = fastSafeStringify(definitionSchema);
        const exportValue: ISchemaExportInfo[] =
          definitionId !== id
            ? [
                {
                  name: definitionId,
                  to: [id],
                },
              ]
            : [];

        const definitionRecord: IDatabaseRecord = {
          id: definitionId,
          import: [],
          export: exportValue,
          schema: definitionStringified,
          schemaobj: definitionSchema,
        };

        return definitionRecord;
      });

    const importValue = definitions
      .map((definition) => definition.id)
      .filter((definition) => id !== definition)
      .map(
        (definition): ISchemaImportInfo => ({
          name: id,
          from: [definition],
        }),
      );

    const record: IDatabaseRecord = {
      id,
      import: importValue,
      export: [],
      schema: stringified,
      schemaobj: { ...targetSchema, definitions: undefined },
    };

    return { record, definitions };
  }

  const record: IDatabaseRecord = {
    id,
    import: [],
    export: [],
    schema: stringified,
    schemaobj: targetSchema,
  };

  return { record };
}

import IDatabaseRecord from '@modules/interfaces/IDatabaseRecord';
import { TDatabase } from '@modules/interfaces/TDatabase';
import mergeSchemaRecords from '@modules/mergeSchemaRecords';

export default function deleteSchemaRecord(db: TDatabase, typeName: string) {
  if (db[typeName] == null) {
    return db;
  }

  const record: IDatabaseRecord = db[typeName];

  // stage 01. imported schema information update
  const importFroms = record.import.from;
  const importUpdatedRecords: IDatabaseRecord[] = importFroms
    .map((importFrom) => db[importFrom])
    .map((importFrom) => {
      const exportInfo: IDatabaseRecord['export'] = {
        ...importFrom.export,
        to: importFrom.export.to.filter((exportTo) => exportTo !== typeName),
      };

      return {
        ...importFrom,
        export: exportInfo,
      };
    });

  // TODO: compile json-schema and check delete id in definitions
  const importUpdatedRecordMap = importUpdatedRecords.reduce((aggregation, updateExportRecord) => {
    return { ...aggregation, [updateExportRecord.id]: updateExportRecord };
  }, {});

  // stage 02. exported schema information update
  const exportTos = record.export.to;
  const exportUpdatedRecords = exportTos
    .map((exportTo) => db[exportTo])
    .map((exportTo) => {
      const importInfo: IDatabaseRecord['import'] = {
        ...exportTo.import,
        from: exportTo.import.from.filter((importFrom) => importFrom !== typeName),
      };

      return {
        ...exportTo,
        import: importInfo,
      };
    });

  // TODO: compile json-schema and check delete id in definitions
  const exportUpdatedRecordMap = exportUpdatedRecords.reduce((aggregation, updateExportRecord) => {
    return { ...aggregation, [updateExportRecord.id]: updateExportRecord };
  }, {});

  const cycleRefrenceRecords = exportUpdatedRecords.filter(
    (exportUpdatedRecord) => importUpdatedRecordMap[exportUpdatedRecord.id] != null,
  );

  // stage 03. cycle reference schema update
  const mergedCycleRefrenceRecords = cycleRefrenceRecords
    .map((cycleRefrenceRecord) =>
      mergeSchemaRecords(
        { [cycleRefrenceRecord.id]: importUpdatedRecordMap[cycleRefrenceRecord.id] },
        [exportUpdatedRecordMap[cycleRefrenceRecord.id]],
      ),
    )
    .map((mergedDb) => Object.values(mergedDb))
    .flat();

  const mergedCycleRefrenceRecordMap = mergedCycleRefrenceRecords.reduce(
    (aggregation, mergedCycleRefrenceRecord) => {
      return { ...aggregation, [mergedCycleRefrenceRecord.id]: mergedCycleRefrenceRecords };
    },
    {},
  );

  // stage 04. aggregate schema of database
  const remainRecords = [
    ...importUpdatedRecords.filter(
      (importUpdatedRecord) => mergedCycleRefrenceRecordMap[importUpdatedRecord.id] == null,
    ),
    ...exportUpdatedRecords.filter(
      (exportUpdatedRecord) => mergedCycleRefrenceRecordMap[exportUpdatedRecord.id] == null,
    ),
    ...mergedCycleRefrenceRecords,
  ].concat(
    Object.values(db)
      .filter((entry) => entry.id !== typeName)
      .filter((entry) => importUpdatedRecordMap[entry.id] == null)
      .filter((entry) => exportUpdatedRecordMap[entry.id] == null),
  );

  // stage 05. generate new database
  const newDb = Object.values(remainRecords).reduce<TDatabase>((aggregation, remainRecord) => {
    return { ...aggregation, [remainRecord.id]: remainRecord };
  }, {});

  return newDb;
}

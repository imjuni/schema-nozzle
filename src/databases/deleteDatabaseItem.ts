import mergeDatabaseItems from '#databases/mergeDatabaseItems';
import type IDatabaseItem from '#modules/interfaces/IDatabaseItem';
import type { TDatabase } from '#modules/interfaces/TDatabase';

export default function deleteDatabaseItem(db: TDatabase, identifier: string) {
  const item = db[identifier];

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (item == null) {
    return db;
  }

  // stage 01. imported schema information update
  const importFroms = item.dependency.import.from;
  const importUpdatedRecords: IDatabaseItem[] = importFroms
    .map((importFrom) => db[importFrom])
    .map((importFrom) => {
      const exportInfo: IDatabaseItem['dependency']['export'] = {
        ...importFrom.dependency.export,
        to: importFrom.dependency.export.to.filter((exportTo) => exportTo !== identifier),
      };

      return {
        ...importFrom,
        export: exportInfo,
      };
    });

  // TODO: compile json-schema and check delete id in definitions
  const importUpdatedRecordMap = importUpdatedRecords.reduce<
    Partial<Record<string, IDatabaseItem>>
  >((aggregation, updateExportRecord) => {
    return { ...aggregation, [updateExportRecord.id]: updateExportRecord };
  }, {});

  // stage 02. exported schema information update
  const exportTos = item.dependency.export.to;
  const exportUpdatedRecords = exportTos
    .map((exportTo) => db[exportTo])
    .map((exportTo) => {
      const importInfo: IDatabaseItem['dependency']['import'] = {
        ...exportTo.dependency.import,
        from: exportTo.dependency.import.from.filter((importFrom) => importFrom !== identifier),
      };

      return {
        ...exportTo,
        import: importInfo,
      };
    });

  // TODO: compile json-schema and check delete id in definitions
  const exportUpdatedRecordMap = exportUpdatedRecords.reduce<
    Partial<Record<string, IDatabaseItem>>
  >((aggregation, updateExportRecord) => {
    return { ...aggregation, [updateExportRecord.id]: updateExportRecord };
  }, {});

  const cycleRefrenceRecords = exportUpdatedRecords.filter(
    (exportUpdatedRecord) => importUpdatedRecordMap[exportUpdatedRecord.id] != null,
  );

  // stage 03. cycle reference schema update
  const mergedCycleRefrenceRecords = cycleRefrenceRecords
    .map((cycleRefrenceRecord) => {
      const exportedItem = exportUpdatedRecordMap[cycleRefrenceRecord.id];
      if (exportedItem != null) {
        return mergeDatabaseItems(
          { [cycleRefrenceRecord.id]: importUpdatedRecordMap[cycleRefrenceRecord.id] },
          [exportedItem],
        );
      }

      return { [cycleRefrenceRecord.id]: importUpdatedRecordMap[cycleRefrenceRecord.id] };
    })
    .map((mergedDb) => Object.values(mergedDb))
    .flat();

  const mergedCycleRefrenceRecordMap = mergedCycleRefrenceRecords.reduce(
    (aggregation, mergedCycleRefrenceRecord) => {
      if (mergedCycleRefrenceRecord?.id != null) {
        return { ...aggregation, [mergedCycleRefrenceRecord.id]: mergedCycleRefrenceRecords };
      }
      return aggregation;
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
      .filter((entry) => entry.id !== identifier)
      .filter((entry) => importUpdatedRecordMap[entry.id] == null)
      .filter((entry) => exportUpdatedRecordMap[entry.id] == null),
  );

  // stage 05. generate new database
  const newDb = Object.values(remainRecords).reduce<TDatabase>((aggregation, remainRecord) => {
    if (remainRecord?.id != null) {
      return { ...aggregation, [remainRecord.id]: remainRecord };
    }

    return aggregation;
  }, {});

  return newDb;
}

import { LokiDbContainer } from '#/databases/files/LokiDb';
import type { IDatabaseItem } from '#/modules/interfaces/IDatabaseItem';

export function deleteDatabaseItem(identifier: string) {
  const item = LokiDbContainer.it.find(identifier);

  if (item == null) {
    return;
  }

  // stage 01. imported schema information update
  const importFroms = item.dependency.import.from;
  const importUpdatedRecords: IDatabaseItem[] = importFroms
    .map((importFrom) => {
      return LokiDbContainer.it.find(importFrom);
    })
    .filter((importFrom): importFrom is IDatabaseItem => importFrom != null)
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
  const importUpdatedRecordMap = new Map<string, IDatabaseItem>(
    Object.entries(importUpdatedRecords),
  );

  // stage 02. exported schema information update
  const exportTos = item.dependency.export.to;
  const exportUpdatedRecords = exportTos
    .map((exportTo) => {
      return LokiDbContainer.it.find(exportTo);
    })
    .filter((exportTo): exportTo is IDatabaseItem => exportTo != null)
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
  const exportUpdatedRecordMap = new Map<string, IDatabaseItem>(
    Object.entries(exportUpdatedRecords),
  );

  const cycleRefrenceRecords = exportUpdatedRecords.filter(
    (exportUpdatedRecord) => importUpdatedRecordMap.get(exportUpdatedRecord.id) != null,
  );

  // stage 03. cycle reference schema update
  cycleRefrenceRecords.forEach((cycleRefrenceRecord) => {
    const exportedItem = exportUpdatedRecordMap.get(cycleRefrenceRecord.id);
    const importedItem = importUpdatedRecordMap.get(cycleRefrenceRecord.id);

    if (exportedItem != null && importedItem != null) {
      LokiDbContainer.it.merge(importedItem);
    }
  });
}

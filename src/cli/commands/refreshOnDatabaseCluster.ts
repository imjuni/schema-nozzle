import spinner from '#cli/display/spinner';
import getResolvedPaths from '#configs/getResolvedPaths';
import getSchemaGeneratorOption from '#configs/getSchemaGeneratorOption';
import type TRefreshSchemaOption from '#configs/interfaces/TRefreshSchemaOption';
import openDatabase from '#databases/openDatabase';
import saveDatabase from '#databases/saveDatabase';
import type IDatabaseRecord from '#modules/interfaces/IDatabaseRecord';
import mergeSchemaRecords from '#modules/mergeSchemaRecords';
import { CE_WORKER_ACTION } from '#workers/interfaces/CE_WORKER_ACTION';
import type TMasterToWorkerMessage from '#workers/interfaces/TMasterToWorkerMessage';
import workers from '#workers/workers';
import cluster from 'cluster';
import { atOrThrow, isError, populate } from 'my-easy-fp';
import { getDirname } from 'my-node-fp';
import os from 'os';
import path from 'path';
import type { SetRequired } from 'type-fest';

export default async function refreshOnDatabaseCluster(option: TRefreshSchemaOption) {
  try {
    populate(os.cpus().length).forEach(() => {
      workers.add(cluster.fork());
    });

    spinner.start('TypeScript source code compile, ...');

    const resolvedPaths = getResolvedPaths(option);

    workers.sendAll({
      command: CE_WORKER_ACTION.OPTION_LOAD,
      data: { option, resolvedPaths },
    });

    let reply = await workers.wait();

    if (atOrThrow(reply.data, 0).result === 'fail') {
      throw new Error('');
    }

    spinner.update({ message: 'TypeScript source code compile success', channel: 'succeed' });

    workers.send({ command: CE_WORKER_ACTION.PROJECT_DIAGOSTIC });

    reply = await workers.wait();

    if (atOrThrow(reply.data, 0).result === 'fail') {
      throw new Error('');
    }

    spinner.start('Open database, ...');

    const db = await openDatabase(resolvedPaths);
    spinner.update({ message: 'database open success', channel: 'succeed' });

    const basePath = await getDirname(resolvedPaths.project);
    const targetTypes = Object.values(db)
      .filter(
        (record): record is SetRequired<IDatabaseRecord, 'filePath'> => record.filePath != null,
      )
      .map((record) => {
        return {
          filePath: path.join(basePath, record.filePath),
          typeName: record.id,
        };
      });

    const generatorOption = await getSchemaGeneratorOption(option);

    spinner.start('Schema generation start, ...');

    const jobs = targetTypes.map((typeInfo) => {
      const payload: TMasterToWorkerMessage = {
        command: 'job',
        data: {
          fileWithTypes: typeInfo,
          option,
          resolvedPaths,
          generatorOption,
        },
      };

      return payload;
    });

    workers.send(...jobs);
    await workers.wait();

    const newDb = mergeSchemaRecords(db, workers.records);
    await saveDatabase(option, newDb);

    spinner.stop({
      message: `[${targetTypes
        .map((targetType) => `"${targetType.typeName}"`)
        .join(', ')}] add complete`,
      channel: 'succeed',
    });
  } catch (catched) {
    spinner.stop({ message: 'Error occured...', channel: 'fail' });
    const err = isError(catched) ?? new Error('Unknown error raised');
    throw err;
  }
}

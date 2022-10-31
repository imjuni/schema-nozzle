import spinner from '@cli/spinner';
import ITruncateSchemaOption from '@configs/interfaces/ITruncateSchemaOption';
import saveDatabase from '@databases/saveDatabase';
// import WorkerContainer from '@workers/WorkerContainer';
import { isError } from 'my-easy-fp';

export default async function truncateOnDatabase(
  option: ITruncateSchemaOption,
  isMessage?: boolean,
) {
  try {
    spinner.isEnable = isMessage ?? false;
    spinner.start('Database truncate start, ...');

    await saveDatabase(option, {});

    spinner.stop({
      message: 'truncate complete',
      channel: 'succeed',
    });
  } catch (catched) {
    spinner.stop({ message: 'Error occured...', channel: 'fail' });
    const err = isError(catched) ?? new Error('Unknown error raised');
    throw err;
  }
}

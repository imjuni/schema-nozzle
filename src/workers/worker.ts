import { isError } from 'my-easy-fp';
import logger from 'src/tools/logger';
import NozzleEmitter from 'src/workers/NozzleEmitter';
import type TMasterToWorkerMessage from 'src/workers/interfaces/TMasterToWorkerMessage';

const log = logger();

export default async function worker() {
  const emitter: NozzleEmitter = new NozzleEmitter();

  process.on('message', (payload: TMasterToWorkerMessage) => {
    try {
      log.trace(`worker message-01: ${typeof payload}-${payload.command}`);

      if ('data' in payload) {
        emitter.emit(payload.command, payload.data);
      } else {
        emitter.emit(payload.command);
      }
    } catch (caught) {
      const err = isError(caught, new Error('unknown error raised'));

      log.trace(err.message);
      log.trace(err.stack);
    }
  });
}

import logger from '#/tools/logger';
import NozzleEmitter from '#/workers/NozzleEmitter';
import type TMasterToWorkerMessage from '#/workers/interfaces/TMasterToWorkerMessage';
import { isError } from 'my-easy-fp';

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

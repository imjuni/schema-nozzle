/* eslint-disable @typescript-eslint/no-misused-promises */
import logger from '#tools/logger';
import type TMasterToWorkerMessage from '#workers/interfaces/TMasterToWorkerMessage';
import NozzleEmitter from '#workers/NozzleEmitter';

const log = logger();

export default async function worker2() {
  const emitter: NozzleEmitter = new NozzleEmitter();

  process.on('message', async (payload: TMasterToWorkerMessage) => {
    log.trace(`worker message-01: ${typeof payload}-${payload.command}`);

    if ('data' in payload) {
      emitter.emit(payload.command, payload.data);
    } else {
      emitter.emit(payload.command);
    }
  });
}

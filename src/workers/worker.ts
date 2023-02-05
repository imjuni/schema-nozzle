/* eslint-disable @typescript-eslint/no-misused-promises */
import logger from '#tools/logger';
import type TMasterToWorkerMessage from '#workers/interfaces/TMasterToWorkerMessage';
import NozzleEmitter from '#workers/NozzleEmitter';

const log = logger();
log.level = 'trace';

export default async function worker2() {
  const emitter: NozzleEmitter = new NozzleEmitter();

  process.on('message', async (payload: TMasterToWorkerMessage) => {
    log.trace(`worker message-01: ${typeof payload}`);
    log.trace(`worker message-02: ${JSON.stringify(payload)}`);

    if ('data' in payload) {
      emitter.emit(payload.command, payload.data);
    } else {
      emitter.emit(payload.command);
    }
  });
}

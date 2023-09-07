import type { TFailData } from 'src/workers/interfaces/TWorkerToMasterMessage';

export default class SchemaNozzleError extends Error {
  readonly data: Omit<TFailData, 'message' | 'stack'>;

  constructor(args: TFailData) {
    super(args.message);

    this.message = args.message;
    this.stack = args.stack;
    this.data = args;
  }
}

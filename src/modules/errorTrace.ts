import { isError } from 'my-easy-fp';
import logger from 'src/tools/logger';

const log = logger();

export default function errorTrace(caught: unknown) {
  const err = isError(caught, new Error('unknown error raised'));
  log.trace(err.message);
  log.trace(err.stack);
}

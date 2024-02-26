import consola from 'consola';
import { isError } from 'my-easy-fp';

export default function errorTrace(caught: unknown) {
  const err = isError(caught, new Error('unknown error raised'));
  consola.trace(err.message);
  consola.trace(err.stack);
}

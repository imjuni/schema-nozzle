import { parse } from 'jsonc-parser';
import { isError } from 'my-easy-fp';
import { fail, pass, PassFailEither } from 'my-only-either';

export default function safeParse<T>(db: string): PassFailEither<Error, T> {
  try {
    return pass(parse(db) as T);
  } catch (catched) {
    const err = isError(catched) ?? new Error('json parsing fail');
    return fail(err);
  }
}

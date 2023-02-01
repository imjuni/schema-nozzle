import { parse, type ParseError } from 'jsonc-parser';
import { isError } from 'my-easy-fp';
import { fail, pass, type PassFailEither } from 'my-only-either';

export default function safeParse<T>(db: string): PassFailEither<Error, T> {
  try {
    const errors: ParseError[] = [];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const parsed = parse(db, errors, { allowEmptyContent: false });

    if (errors.length > 0) {
      throw new Error(`invalid json: ${db.substring(0, 30)}${db.length > 30 ? '...' : ''}`);
    }

    return pass(parsed);
  } catch (catched) {
    const err = isError(catched, new Error('unknown error raised'));
    return fail(err);
  }
}

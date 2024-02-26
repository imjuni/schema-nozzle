import { parse, type ParseError } from 'jsonc-parser';
import { isError } from 'my-easy-fp';
import { fail, pass, type PassFailEither } from 'my-only-either';

export function safeParse<T>(db: string): PassFailEither<Error, T> {
  try {
    const errors: ParseError[] = [];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const parsed = parse(db, errors, { allowEmptyContent: false });

    if (errors.length > 0) {
      return fail(new Error(`invalid json: ${db.substring(0, 30)}${db.length > 30 ? '...' : ''}`));
    }

    return pass(parsed);
  } catch (caught) {
    const err = isError(caught, new Error('unknown error raised'));
    return fail(err);
  }
}

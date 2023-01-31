import type IDeleteSchemaOption from '#configs/interfaces/IDeleteSchemaOption';
import type ITruncateSchemaOption from '#configs/interfaces/ITruncateSchemaOption';
import type TAddSchemaOption from '#configs/interfaces/TAddSchemaOption';
import type TRefreshSchemaOption from '#configs/interfaces/TRefreshSchemaOption';
import { getDirname } from 'my-node-fp';

export default async function withDefaultOption<
  T extends TAddSchemaOption | IDeleteSchemaOption | ITruncateSchemaOption | TRefreshSchemaOption,
>(option: T): Promise<T> {
  const next = { ...option };

  if (next.output == null || next.output === '') {
    next.output = await getDirname(option.project);
  }

  return next;
}

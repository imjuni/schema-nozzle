import type IAddSchemaOption from '@configs/interfaces/IAddSchemaOption';
import type IDeleteSchemaOption from '@configs/interfaces/IDeleteSchemaOption';
import type IRefreshSchemaOption from '@configs/interfaces/IRefreshSchemaOption';
import type ITruncateSchemaOption from '@configs/interfaces/ITruncateSchemaOption';
import { getDirname } from 'my-node-fp';

export default async function withDefaultOption<
  T extends IAddSchemaOption | IDeleteSchemaOption | ITruncateSchemaOption | IRefreshSchemaOption,
>(option: T): Promise<T> {
  const next = { ...option };

  if (next.output == null || next.output === '') {
    next.output = await getDirname(option.project);
  }

  return next;
}

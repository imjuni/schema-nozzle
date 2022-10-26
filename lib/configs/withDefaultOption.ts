import IAddSchemaOption from '@configs/interfaces/IAddSchemaOption';
import IDeleteSchemaOption from '@configs/interfaces/IDeleteSchemaOption';
import IRefreshSchemaOption from '@configs/interfaces/IRefreshSchemaOption';
import ITruncateSchemaOption from '@configs/interfaces/ITruncateSchemaOption';
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

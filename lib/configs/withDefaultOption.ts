import type TAddSchemaOption from '#configs/interfaces/TAddSchemaOption';
import type TDeleteSchemaOption from '#configs/interfaces/TDeleteSchemaOption';
import type TRefreshSchemaOption from '#configs/interfaces/TRefreshSchemaOption';
import type TTruncateSchemaOption from '#configs/interfaces/TTruncateSchemaOption';
import { getDirname } from 'my-node-fp';

export default async function withDefaultOption<
  T extends TAddSchemaOption | TDeleteSchemaOption | TTruncateSchemaOption | TRefreshSchemaOption,
>(option: T): Promise<T> {
  const next = { ...option };

  if (next.output == null || next.output === '') {
    next.output = await getDirname(option.project);
  }

  return next;
}
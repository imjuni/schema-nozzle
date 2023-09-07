import { getDirname } from 'my-node-fp';
import type TAddSchemaOption from 'src/configs/interfaces/TAddSchemaOption';
import type TDeleteSchemaOption from 'src/configs/interfaces/TDeleteSchemaOption';
import type TRefreshSchemaOption from 'src/configs/interfaces/TRefreshSchemaOption';
import type TTruncateSchemaOption from 'src/configs/interfaces/TTruncateSchemaOption';
import type TWatchSchemaOption from 'src/configs/interfaces/TWatchSchemaOption';

export default async function withDefaultOption<
  T extends
    | TAddSchemaOption
    | TDeleteSchemaOption
    | TTruncateSchemaOption
    | TRefreshSchemaOption
    | TWatchSchemaOption,
>(option: T): Promise<T> {
  const next = { ...option };

  if (next.output === '') {
    next.output = await getDirname(option.project);
  }

  return next;
}

import IAddSchemaOption from '@configs/interfaces/IAddSchemaOption';
import IDeleteSchemaOption from '@configs/interfaces/IDeleteSchemaOption';
import ITruncateSchemaOption from '@configs/interfaces/ITruncateSchemaOption';
import { getDirname } from 'my-node-fp';

export default async function withDefaultOption<
  T extends IAddSchemaOption | IDeleteSchemaOption | ITruncateSchemaOption,
>(option: T): Promise<T> {
  if (option.output == null || option.output === '') {
    return { ...option, output: await getDirname(option.project) };
  }

  return option;
}

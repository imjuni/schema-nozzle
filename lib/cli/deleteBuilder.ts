import IDeleteSchemaOption from '@configs/interfaces/IDeleteSchemaOption';
import { Argv } from 'yargs';

export default function deleteBuilder(argv: Argv<{}>) {
  return argv as Argv<IDeleteSchemaOption>;
}

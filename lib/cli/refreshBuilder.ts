import IRefreshSchemaOption from '@configs/interfaces/IRefreshSchemaOption';
import { Argv } from 'yargs';

export default function refreshBuilder(argv: Argv<{}>) {
  return argv as Argv<IRefreshSchemaOption>;
}

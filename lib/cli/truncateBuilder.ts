import ITruncateSchemaOption from '@configs/interfaces/ITruncateSchemaOption';
import { Argv } from 'yargs';

export default function truncateBuilder(argv: Argv<{}>) {
  return argv as Argv<ITruncateSchemaOption>;
}

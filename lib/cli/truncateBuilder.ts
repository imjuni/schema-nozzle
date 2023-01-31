import type ITruncateSchemaOption from '#configs/interfaces/ITruncateSchemaOption';
import type { Argv } from 'yargs';

export default function truncateBuilder(argv: Argv<{}>) {
  return argv as Argv<ITruncateSchemaOption>;
}

import type TTruncateSchemaOption from 'src/configs/interfaces/TTruncateSchemaOption';
import type { Argv } from 'yargs';

export default function truncateBuilder(argv: Argv) {
  return argv as Argv<TTruncateSchemaOption>;
}

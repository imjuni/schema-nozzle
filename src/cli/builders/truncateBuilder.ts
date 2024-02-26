import type { TTruncateSchemaOption } from '#/configs/interfaces/TTruncateSchemaOption';
import type { Argv } from 'yargs';

export function truncateBuilder(argv: Argv) {
  return argv as Argv<TTruncateSchemaOption>;
}

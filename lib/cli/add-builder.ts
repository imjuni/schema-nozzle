import IAddSchemaOption from '@configs/interfaces/IAddSchemaOption';
import { Argv } from 'yargs';

export default function addBuilder(argv: Argv<{}>) {
  // have no alias option
  argv.option('output', {
    alias: 'o',
    describe: 'database file path',
    type: 'string',
    demandOption: true,
  });

  return argv as Argv<IAddSchemaOption>;
}

import IDatabaseOption from '@configs/interfaces/IDatabaseOption';
import { Argv } from 'yargs';

export default function dbBuilder(argv: Argv<{}>) {
  // have no alias option
  argv.option('output', {
    alias: 'o',
    describe: 'database file path',
    type: 'string',
    demandOption: true,
  });

  return argv as Argv<IDatabaseOption>;
}

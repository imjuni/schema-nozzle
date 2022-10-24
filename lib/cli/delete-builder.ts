import IDeleteSchemaOption from '@configs/interfaces/IDeleteSchemaOption';
import { Argv } from 'yargs';

export default function deleteBuilder(argv: Argv<{}>) {
  // have no alias option
  argv.option('output', {
    alias: 'o',
    describe: 'database file path',
    type: 'string',
    demandOption: true,
  });

  return argv as Argv<IDeleteSchemaOption>;
}

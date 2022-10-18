import IConsoleOption from '@configs/interfaces/IConsoleOption';
import { Argv } from 'yargs';

export default function consoleBuilder(argv: Argv<{}>) {
  // have no alias option
  argv.option('output', {
    describe: 'output file path',
    type: 'string',
  });

  return argv as Argv<IConsoleOption>;
}

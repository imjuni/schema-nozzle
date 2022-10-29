import IRefreshSchemaOption from '@configs/interfaces/IRefreshSchemaOption';
import { Argv } from 'yargs';

export default function refreshBuilder(argv: Argv<{}>) {
  argv.option('generator-option', {
    describe: 'ts-json-schema-generator option file path',
    type: 'string',
  });

  return argv as Argv<IRefreshSchemaOption>;
}

import type TAddSchemaOption from 'src/configs/interfaces/TAddSchemaOption';
import type TRefreshSchemaOption from 'src/configs/interfaces/TRefreshSchemaOption';
import type TWatchSchemaOption from 'src/configs/interfaces/TWatchSchemaOption';
import type { SetRequired } from 'type-fest';

export default function isRelativeDtoPath(
  option:
    | Pick<TAddSchemaOption, 'rootDir' | 'includePath'>
    | Pick<TRefreshSchemaOption, 'rootDir' | 'includePath'>
    | Pick<TWatchSchemaOption, 'rootDir' | 'includePath'>,
): option is SetRequired<typeof option, 'rootDir'> {
  if (option.rootDir == null) {
    return false;
  }

  return option.includePath ?? false;
}

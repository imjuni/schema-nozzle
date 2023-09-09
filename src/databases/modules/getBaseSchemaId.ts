import { getDirnameSync } from 'my-node-fp';
import path from 'path';
import type TAddSchemaOption from 'src/configs/interfaces/TAddSchemaOption';
import type TRefreshSchemaOption from 'src/configs/interfaces/TRefreshSchemaOption';
import type TWatchSchemaOption from 'src/configs/interfaces/TWatchSchemaOption';
import getDtoName from 'src/databases/modules/getDtoName';
import isRelativeDtoPath from 'src/databases/modules/isRelativeDtoPath';

export default function getBaseSchemaId(
  schemaId: string,
  filePath: string,
  option:
    | Pick<TAddSchemaOption, 'rootDir' | 'includePath'>
    | Pick<TRefreshSchemaOption, 'rootDir' | 'includePath'>
    | Pick<TWatchSchemaOption, 'rootDir' | 'includePath'>,
) {
  if (isRelativeDtoPath(option)) {
    const dtoName = `${schemaId.replace('#/definitions/', '')}`;

    const relativePath = path.relative(option.rootDir, getDirnameSync(filePath)).replace('./', '');

    return getDtoName(
      dtoName,
      (v) => `#/${[relativePath, v].filter((element) => element !== '').join('/')}`,
    );
  }

  const dtoName = `${schemaId.replace('#/definitions/', '')}`;
  return dtoName;
}

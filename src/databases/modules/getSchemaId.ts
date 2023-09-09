import { getDirnameSync } from 'my-node-fp';
import path from 'path';
import type TAddSchemaOption from 'src/configs/interfaces/TAddSchemaOption';
import type TRefreshSchemaOption from 'src/configs/interfaces/TRefreshSchemaOption';
import type TWatchSchemaOption from 'src/configs/interfaces/TWatchSchemaOption';
import getDtoName from 'src/databases/modules/getDtoName';
import isRelativeDtoPath from 'src/databases/modules/isRelativeDtoPath';
import type { getFileImportInfos } from 'ts-morph-short';

export default function getSchemaId(
  schemaId: string,
  importInfos: ReturnType<typeof getFileImportInfos>,
  option:
    | Pick<TAddSchemaOption, 'rootDir' | 'includePath'>
    | Pick<TRefreshSchemaOption, 'rootDir' | 'includePath'>
    | Pick<TWatchSchemaOption, 'rootDir' | 'includePath'>,
) {
  if (isRelativeDtoPath(option)) {
    const dtoName = `${schemaId.replace('#/definitions/', '')}`;
    const findedImportInfo = importInfos.find((importInfo) => importInfo.name === dtoName);

    if (findedImportInfo == null) {
      return getDtoName(dtoName, (v) => `#/${v}`);
    }

    if (findedImportInfo.isExternal || findedImportInfo.moduleFilePath == null) {
      return getDtoName(dtoName, (v) => `#/external/${v}`);
    }

    const relativePath = path
      .relative(option.rootDir, getDirnameSync(findedImportInfo.moduleFilePath))
      .replace('./', '');

    return getDtoName(
      dtoName,
      (v) => `#/${[relativePath, v].filter((element) => element !== '').join('/')}`,
    );
  }

  const dtoName = `${schemaId.replace('#/definitions/', '')}`;
  return dtoName;
}

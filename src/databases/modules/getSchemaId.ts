import { getDirnameSync } from 'my-node-fp';
import path from 'path';
import type TAddSchemaOption from 'src/configs/interfaces/TAddSchemaOption';
import type TRefreshSchemaOption from 'src/configs/interfaces/TRefreshSchemaOption';
import type TWatchSchemaOption from 'src/configs/interfaces/TWatchSchemaOption';
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
  const isDtoPath = isRelativeDtoPath(option);

  if (isDtoPath) {
    if (option.rootDir == null) {
      throw new Error('include-path option need root-dir configuration!');
    }

    const dtoName = `${schemaId.replace('#/definitions/', '')}`;
    const findedImportInfo = importInfos.find((importInfo) => importInfo.name === dtoName);

    if (findedImportInfo == null) {
      return dtoName.startsWith('#/') ? dtoName : `#/${dtoName}`;
    }

    if (findedImportInfo.isExternal || findedImportInfo.moduleFilePath == null) {
      return dtoName.startsWith('#/') ? dtoName : `#/external/${dtoName}`;
    }

    const relativePathWithExt = path
      .relative(option.rootDir, getDirnameSync(findedImportInfo.moduleFilePath))
      .replace('./', '');

    const relativePath =
      relativePathWithExt === '' ? relativePathWithExt : getDirnameSync(relativePathWithExt);

    return dtoName.startsWith('#/')
      ? dtoName
      : `#/${[relativePath, dtoName].filter((element) => element !== '').join('/')}`;
  }

  const dtoName = `${schemaId.replace('#/definitions/', '')}`;
  return dtoName;
}

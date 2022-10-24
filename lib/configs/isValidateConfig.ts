import IAddSchemaOption from '@configs/interfaces/IAddSchemaOption';
import IDeleteSchemaOption from '@configs/interfaces/IDeleteSchemaOption';
import logger from 'lib/tools/logger';
import { existsSync } from 'my-node-fp';
import path from 'path';

const log = logger();

export default function isValidateConfig<T extends IDeleteSchemaOption | IAddSchemaOption>(
  option: T,
) {
  const { project } = option;
  const resolvedProject = path.isAbsolute(project) ? project : path.resolve(project);

  if (existsSync(resolvedProject) === false) {
    log.error(`Cannot found project: ${resolvedProject}`);
    return false;
  }

  if (option.files != null && option.files.length > 0) {
    const files = option.files.map((file) => ({ file, exists: existsSync(file) }));
    const notExistFiles = files.filter((file) => file.exists === false);
    log.error(`Cannot found files: ${notExistFiles.map((file) => file.file).join(', ')}`);
    return false;
  }

  return true;
}

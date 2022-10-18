import getDiagnostics from '@compilers/getDiagnostics';
import getTsProject from '@compilers/getTsProject';
import getResolvedPaths from '@configs/getResolvedPaths';
import IConsoleOption from '@configs/interfaces/IConsoleOption';
import IDatabaseOption from '@configs/interfaces/IDatabaseOption';
import saveScheams from '@databases/saveScheams';
import createJSONSchema from '@modules/createJSONSchema';
import getFiles from '@modules/getFiles';
import getTargetTypes from '@modules/getTargetTypes';
import getTypes from '@modules/getTypes';
import logger from '@tools/logger';

const log = logger();

export async function createOnDatabase(nullableOption: IDatabaseOption) {
  const resolvedPaths = getResolvedPaths(nullableOption);
  const project = await getTsProject(resolvedPaths.project);

  if (project.type === 'fail') throw project.fail;

  const files = await getFiles({ resolvedPaths, option: nullableOption });

  if (files.type === 'fail') throw files.fail;

  const diagnostics = getDiagnostics({ option: nullableOption, project: project.pass });

  if (diagnostics.type === 'fail') throw diagnostics.fail;

  const types = await getTypes({
    project: project.pass,
    option: { ...nullableOption, files: files.pass },
  });

  if (types.type === 'fail') throw types.fail;

  const option: IDatabaseOption = { ...nullableOption, files: files.pass, types: types.pass };

  const targetTypes = getTargetTypes({ project: project.pass, option });

  const schemas = targetTypes.exportedTypes.map((targetType) =>
    createJSONSchema({
      option,
      schemaConfig: undefined,
      type: targetType.type,
      filePath: targetType.filePath,
      typeName: targetType.identifier,
    }),
  );

  await saveScheams(option, resolvedPaths, ...schemas);
  return schemas;
}

export async function createOnConsole(nullableOption: IConsoleOption) {
  log.info(nullableOption);
}

export async function watching() {
  log.trace('watching');
}

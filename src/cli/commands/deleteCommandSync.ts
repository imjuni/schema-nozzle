import { makeSpinner } from '#/cli/display/makeSpinner';
import { getResolvedPaths } from '#/configs/getResolvedPaths';
import type {
  TDeleteSchemaBaseOption,
  TDeleteSchemaOption,
} from '#/configs/interfaces/TDeleteSchemaOption';
import { makePackageJson } from '#/configs/makePackageJson';
import { getBaseOption } from '#/configs/modules/getBaseOption';
import { getGenerateOption } from '#/configs/modules/getGenerateOption';
import { deleting } from '#/modules/cli/commands/deleting';
import { showLogo } from '@maeum/cli-logo';
import { isError } from 'my-easy-fp';
import { ProjectContainer, getTypeScriptConfig, getTypeScriptProject } from 'ts-morph-short';

export async function deleteCommandSync(cliOptions: TDeleteSchemaBaseOption) {
  const spinner = makeSpinner();

  try {
    if (cliOptions.cliLogo) {
      await showLogo({
        message: 'Schema Nozzle',
        figlet: { font: 'ANSI Shadow', width: 80 },
        color: 'cyan',
      });
    } else {
      spinner.start('Schema Nozzle start');
      spinner.stop('Schema Nozzle start', 'info');
    }

    spinner.start('TypeScript project loading, ...');

    makePackageJson();
    const generateOption = await getGenerateOption(cliOptions);
    const resolvedPaths = getResolvedPaths({ ...cliOptions, rootDirs: generateOption.rootDirs });
    const project = getTypeScriptProject(resolvedPaths.project);
    const tsconfig = getTypeScriptConfig(resolvedPaths.project);

    spinner.stop('TypeScript project load success', 'succeed');

    ProjectContainer.bootstrap({ 'schema-nozzle': { project, config: tsconfig } });

    const options: TDeleteSchemaOption = {
      $kind: 'delete-schema',
      ...getBaseOption(cliOptions),
      ...generateOption,
      multiple: cliOptions.multiple,
      cwd: resolvedPaths.cwd,
      projectDir: resolvedPaths.projectDir,
      resolved: resolvedPaths,
      types: [],
    };

    await deleting(project, tsconfig, options);
  } catch (caught) {
    spinner.stop('Error occured...', 'fail');
    const err = isError(caught, new Error('Unknown error raised'));
    throw err;
  }
}

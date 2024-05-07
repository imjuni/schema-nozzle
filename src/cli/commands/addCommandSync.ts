import { makeSpinner } from '#/cli/display/makeSpinner';
import { getResolvedPaths } from '#/configs/getResolvedPaths';
import type { TAddSchemaBaseOption, TAddSchemaOption } from '#/configs/interfaces/TAddSchemaOption';
import { makePackageJson } from '#/configs/makePackageJson';
import { getBaseOption } from '#/configs/modules/getBaseOption';
import { getGenerateOption } from '#/configs/modules/getGenerateOption';
import { adding } from '#/modules/cli/commands/adding';
import { showLogo } from '@maeum/cli-logo';
import { isError } from 'my-easy-fp';
import { ProjectContainer, getTypeScriptConfig, getTypeScriptProject } from 'ts-morph-short';

export async function addCommandSync(cliOptions: TAddSchemaBaseOption): Promise<void> {
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

    spinner.start('TypeScript source code compile, ...');

    makePackageJson();
    const generateOption = await getGenerateOption(cliOptions);
    const resolvedPaths = getResolvedPaths({ ...cliOptions, rootDirs: generateOption.rootDirs });
    const project = getTypeScriptProject(resolvedPaths.project);
    const tsconfig = getTypeScriptConfig(resolvedPaths.project);

    spinner.stop('TypeScript project loaded!', 'succeed');

    ProjectContainer.bootstrap({ 'schema-nozzle': { project, config: tsconfig } });

    const options: TAddSchemaOption = {
      $kind: 'add-schema',
      ...getBaseOption(cliOptions),
      ...generateOption,
      cwd: resolvedPaths.cwd,
      projectDir: resolvedPaths.projectDir,
      resolved: resolvedPaths,
      multiple: cliOptions.multiple,
      types: [],
      files: [],
    };

    await adding(project, tsconfig, options);
  } catch (caught) {
    spinner.stop('Error occured...', 'fail');
    const err = isError(caught, new Error('Unknown error raised'));
    throw err;
  }
}

import { spinner } from '#/cli/display/spinner';
import type { TAddSchemaBaseOption } from '#/configs/interfaces/TAddSchemaOption';
import { adding } from '#/modules/adding';
import { showLogo } from '@maeum/cli-logo';
import { isError } from 'my-easy-fp';
import { ProjectContainer, getTypeScriptConfig, getTypeScriptProject } from 'ts-morph-short';

export async function addCommandSync(options: TAddSchemaBaseOption): Promise<void> {
  try {
    if (options.cliLogo) {
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

    const project = getTypeScriptProject(options.project);
    const tsconfig = getTypeScriptConfig(options.project);

    spinner.stop('TypeScript project load success', 'succeed');

    ProjectContainer.bootstrap({ 'schema-nozzle': { project, config: tsconfig } });

    await adding(project, tsconfig, options);
  } catch (caught) {
    spinner.stop('Error occured...', 'fail');
    const err = isError(caught, new Error('Unknown error raised'));
    throw err;
  }
}

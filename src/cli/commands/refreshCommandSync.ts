import type { Spinner } from '#/cli/display/Spinners';
import { makeProgressBar } from '#/cli/display/makeProgressBar';
import { makeSpinner } from '#/cli/display/makeSpinner';
import { getResolvedPaths } from '#/configs/getResolvedPaths';
import type { TRefreshSchemaBaseOption } from '#/configs/interfaces/TRefreshSchemaOption';
import { container } from '#/modules/containers/container';
import { SPINNER_SYMBOL_KEY } from '#/modules/containers/keys';
import { refreshing } from '#/modules/refreshing';
import { showLogo } from '@maeum/cli-logo';
import { isError } from 'my-easy-fp';
import { ProjectContainer, getTypeScriptConfig, getTypeScriptProject } from 'ts-morph-short';

export async function refreshCommandSync(options: TRefreshSchemaBaseOption) {
  makeProgressBar();
  makeSpinner();

  const spinner = container.resolve<Spinner>(SPINNER_SYMBOL_KEY);

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

    const resolvedPaths = getResolvedPaths(options);
    const project = getTypeScriptProject(resolvedPaths.project);
    const tsconfig = getTypeScriptConfig(resolvedPaths.project);

    spinner.stop('TypeScript project loaded!', 'succeed');

    ProjectContainer.bootstrap({ 'schema-nozzle': { project, config: tsconfig } });

    await refreshing(project, tsconfig, options);
  } catch (caught) {
    spinner.stop('Error occured...', 'fail');
    const err = isError(caught, new Error('Unknown error raised'));
    throw err;
  }
}

import { spinner } from '#/cli/display/spinner';
import { getResolvedPaths } from '#/configs/getResolvedPaths';
import { getSchemaGeneratorOption } from '#/configs/getSchemaGeneratorOption';
import type {
  TRefreshSchemaBaseOption,
  TRefreshSchemaOption,
} from '#/configs/interfaces/TRefreshSchemaOption';
import { refreshing } from '#/modules/refreshing';
import { showLogo } from '@maeum/cli-logo';
import { isError } from 'my-easy-fp';
import { ProjectContainer, getTypeScriptConfig, getTypeScriptProject } from 'ts-morph-short';

export async function refreshCommandSync(baseOption: TRefreshSchemaBaseOption) {
  try {
    if (baseOption.cliLogo) {
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

    const resolvedPaths = getResolvedPaths(baseOption);
    const option: TRefreshSchemaOption = {
      ...baseOption,
      ...resolvedPaths,
      discriminator: 'refresh-schema',
      files: [],
      generatorOptionObject: {},
    };

    option.generatorOptionObject = await getSchemaGeneratorOption(option);

    const project = getTypeScriptProject(option.project);
    const tsconfig = getTypeScriptConfig(option.project);

    ProjectContainer.bootstrap({ 'schema-nozzle': { project, config: tsconfig } });

    await refreshing(project, tsconfig, baseOption);
  } catch (caught) {
    spinner.stop('Error occured...', 'fail');
    const err = isError(caught, new Error('Unknown error raised'));
    throw err;
  }
}

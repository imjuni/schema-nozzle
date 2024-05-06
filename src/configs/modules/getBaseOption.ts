import type { IBaseOption } from '#/configs/interfaces/IBaseOption';
import { getOutputPath } from '#/configs/modules/getOutputPath';
import { getCwd } from '#/tools/getCwd';
import type { SetRequired } from 'type-fest';

export function getBaseOption(option: SetRequired<Partial<IBaseOption>, 'project'>): IBaseOption {
  const cwd = getCwd(process.env);

  const { config, project } = option;
  const output = getOutputPath(cwd, project, option.output);
  const cliLogo = option.cliLogo ?? false;

  return {
    config,
    project,
    output,
    cliLogo,
  };
}

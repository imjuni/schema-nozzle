import { ProgressBar } from '#/cli/display/ProgressBar';
import { container } from '#/modules/containers/container';
import { PROGRESS_BAR_SYMBOL_KEY } from '#/modules/containers/keys';
import { asValue } from 'awilix';
import { isFalse } from 'my-easy-fp';

export function makeProgressBar() {
  if (isFalse(container.hasRegistration(PROGRESS_BAR_SYMBOL_KEY))) {
    const progressBar = new ProgressBar();
    container.register(PROGRESS_BAR_SYMBOL_KEY, asValue(progressBar));

    return progressBar;
  }

  return container.resolve<ProgressBar>(PROGRESS_BAR_SYMBOL_KEY);
}

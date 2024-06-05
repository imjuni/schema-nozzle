import { ProgressBar } from '#/cli/display/ProgressBar';
import { container } from '#/modules/containers/container';
import { $YMBOL_KEY_PROGRESS_BAR } from '#/modules/containers/keys';
import { asValue } from 'awilix';
import { isFalse } from 'my-easy-fp';

export function makeProgressBar() {
  if (isFalse(container.hasRegistration($YMBOL_KEY_PROGRESS_BAR))) {
    const progressBar = new ProgressBar();
    container.register($YMBOL_KEY_PROGRESS_BAR, asValue(progressBar));

    return progressBar;
  }

  return container.resolve<ProgressBar>($YMBOL_KEY_PROGRESS_BAR);
}

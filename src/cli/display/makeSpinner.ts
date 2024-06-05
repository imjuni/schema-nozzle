import { Spinner } from '#/cli/display/Spinners';
import { container } from '#/modules/containers/container';
import { $YMBOL_KEY_SPINNER } from '#/modules/containers/keys';
import { asValue } from 'awilix';
import { isFalse } from 'my-easy-fp';

export function makeSpinner() {
  if (isFalse(container.hasRegistration($YMBOL_KEY_SPINNER))) {
    const spinner = new Spinner();
    container.register($YMBOL_KEY_SPINNER, asValue(spinner));

    return spinner;
  }

  return container.resolve<Spinner>($YMBOL_KEY_SPINNER);
}

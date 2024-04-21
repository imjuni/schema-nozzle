import { Spinner } from '#/cli/display/Spinners';
import { container } from '#/modules/containers/container';
import { SPINNER_SYMBOL_KEY } from '#/modules/containers/keys';
import { asValue } from 'awilix';
import { isFalse } from 'my-easy-fp';

export function makeSpinner() {
  if (isFalse(container.hasRegistration(SPINNER_SYMBOL_KEY))) {
    const spinner = new Spinner();
    container.register(SPINNER_SYMBOL_KEY, asValue(spinner));

    return spinner;
  }

  return container.resolve<Spinner>(SPINNER_SYMBOL_KEY);
}

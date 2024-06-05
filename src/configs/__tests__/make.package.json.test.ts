import { makePackageJson } from '#/configs/makePackageJson';
import { container } from '#/modules/containers/container';
import { $YMBOL_KEY_NOZZLE_PACKAGE_JSON } from '#/modules/containers/keys';
import type { PackageJson } from 'type-fest';
import { describe, expect, it } from 'vitest';

describe('makePackageJson', () => {
  it('find, works fine', () => {
    makePackageJson();

    const packageJson = container.resolve<PackageJson>($YMBOL_KEY_NOZZLE_PACKAGE_JSON);
    expect(packageJson.name).toEqual('schema-nozzle');
  });
});

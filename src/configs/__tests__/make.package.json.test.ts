import { makePackageJson } from '#/configs/makePackageJson';
import { container } from '#/modules/containers/container';
import { NOZZLE_PACKAGE_JSON_SYMBOL_KEY } from '#/modules/containers/keys';
import type { PackageJson } from 'type-fest';
import { describe, expect, it } from 'vitest';

describe('makePackageJson', () => {
  it('find, works fine', () => {
    makePackageJson();

    const packageJson = container.resolve<PackageJson>(NOZZLE_PACKAGE_JSON_SYMBOL_KEY);
    expect(packageJson.name).toEqual('schema-nozzle');
  });
});

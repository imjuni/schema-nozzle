import { container } from '#/modules/containers/container';
import { $YMBOL_KEY_NOZZLE_PACKAGE_JSON } from '#/modules/containers/keys';
import { getCwd } from '#/tools/getCwd';
import { asValue } from 'awilix';
import { sync } from 'find-up';
import { parse } from 'jsonc-parser';
import { orThrow } from 'my-easy-fp';
import fs from 'node:fs';
import type { PackageJson } from 'type-fest';

export function makePackageJson() {
  const cwd = getCwd(process.env);
  const packageJsonPath = orThrow(
    sync('package.json', { cwd }),
    new Error('Cannot found package.json'),
  );
  const packageJsonBuf = fs.readFileSync(packageJsonPath);
  const packageJson = parse(packageJsonBuf.toString()) as PackageJson;

  container.register($YMBOL_KEY_NOZZLE_PACKAGE_JSON, asValue(packageJson));
}

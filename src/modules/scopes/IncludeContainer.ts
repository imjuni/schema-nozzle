import { getGlobFiles } from '#/modules/files/getGlobFiles';
import { Glob, type GlobOptions } from 'glob';
import pathe from 'pathe';

export class IncludeContainer {
  #globs: Glob<GlobOptions>[];

  #map: Map<string, boolean>;

  constructor(params: { patterns: string[]; options: GlobOptions }) {
    const globs = new Glob(params.patterns, params.options);
    const files = getGlobFiles(globs).map<[string, boolean]>((filePath) => [filePath, true]);

    this.#map = new Map<string, boolean>(files);
    this.#globs = [globs];
  }

  get globs(): Readonly<Glob<GlobOptions>[]> {
    return this.#globs;
  }

  get map(): Readonly<Map<string, boolean>> {
    return this.#map;
  }

  isInclude(filePath: string): boolean {
    if (this.#map.size <= 0) {
      return false;
    }

    if (pathe.isAbsolute(filePath)) {
      return this.#map.get(filePath) != null;
    }

    return this.#map.get(pathe.resolve(filePath)) != null;
  }

  files() {
    return this.#globs.map((glob) => getGlobFiles(glob)).flat();
  }
}

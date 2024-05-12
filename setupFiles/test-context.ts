import pathe from 'pathe';
import { beforeAll } from 'vitest';

beforeAll(() => {
  const tsconfigDirPath = pathe.join(process.cwd(), 'examples', 'type-project');
  const tsconfigFilePath = pathe.join(tsconfigDirPath, 'tsconfig.json');
  const tsconfigEmptyPath = pathe.join(tsconfigDirPath, 'tsconfig.empty.json');

  const data: {
    tsconfigDirPath: string;
    tsconfigFilePath: string;
    tsconfigEmptyPath: string;
  } = {
    tsconfigDirPath,
    tsconfigFilePath,
    tsconfigEmptyPath,
  };

  globalThis.$context = data;
});

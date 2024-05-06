import { makeStatementInfoMap } from '#/compilers/makeStatementInfoMap';
import { getImportInfo } from '#/modules/generators/getImportInfo';
import pathe from 'pathe';
import { getTypeScriptProject } from 'ts-morph-short';
import { beforeAll, describe, expect, it } from 'vitest';

describe('getImprotInfo', () => {
  beforeAll(() => {
    const tsconfigDirPath = pathe.join(process.cwd(), 'examples');
    const tsconfigFilePath = pathe.join(tsconfigDirPath, 'tsconfig.example.json');
    const project = getTypeScriptProject(tsconfigFilePath);

    project.createSourceFile(
      pathe.join('ability/IHero.ts'),
      `export interface IHero { name: string; ability: string; }`,
    );
    project.createSourceFile(
      pathe.join('ability/TGeneric.ts'),
      `export type TGeneric<T> = Record<string, T>\nexport type TNumberGeneric = TGeneric<number>;`,
    );
    project.createSourceFile(
      pathe.join('organization/IOrganization.ts'),
      `export interface IOrganization { name: string; address: string; }`,
    );
    project.createSourceFile(
      pathe.join('organization/ITeam.ts'),
      `export interface ITeam { name: string; members: string[]; }`,
    );

    makeStatementInfoMap(
      project,
      project.getSourceFiles().map((sourceFile) => sourceFile.getFilePath().toString()),
    );
  });

  it('non generic type searching', () => {
    const r01 = getImportInfo('IHero');
    expect(r01?.name).toEqual('IHero');
  });

  it('non generic type search fail', () => {
    const r01 = getImportInfo('TGenericNotFound');
    expect(r01?.name).toBeUndefined();
  });

  it('generic type searching', () => {
    const r01 = getImportInfo('TGeneric<number>');
    expect(r01?.name).toEqual('TGeneric');
  });

  it('generic type search fail', () => {
    const r01 = getImportInfo('TGenericNotFound<number>');
    expect(r01?.name).toBeUndefined();
  });
});

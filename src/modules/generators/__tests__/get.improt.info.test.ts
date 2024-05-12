import { makeStatementInfoMap } from '#/compilers/makeStatementInfoMap';
import { getImportInfo } from '#/modules/generators/getImportInfo';
import pathe from 'pathe';
import { getTypeScriptProject } from 'ts-morph-short';
import { beforeAll, describe, expect, it } from 'vitest';

const data: { project: ReturnType<typeof getTypeScriptProject> } = {} as any;

describe('getImprotInfo', () => {
  beforeAll(() => {
    data.project = getTypeScriptProject($context.tsconfigFilePath);

    data.project.createSourceFile(
      pathe.join('ability/IHero.ts'),
      `export interface IHero { name: string; ability: string; }`,
    );
    data.project.createSourceFile(
      pathe.join('ability/TGeneric.ts'),
      `export type TGeneric<T> = Record<string, T>\nexport type TNumberGeneric = TGeneric<number>;`,
    );
    data.project.createSourceFile(
      pathe.join('organization/IOrganization.ts'),
      `export interface IOrganization { name: string; address: string; }`,
    );
    data.project.createSourceFile(
      pathe.join('organization/ITeam.ts'),
      `export interface ITeam { name: string; members: string[]; }`,
    );

    makeStatementInfoMap(
      data.project,
      data.project.getSourceFiles().map((sourceFile) => sourceFile.getFilePath().toString()),
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

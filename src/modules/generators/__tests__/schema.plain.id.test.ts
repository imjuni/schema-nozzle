import { makeStatementInfoMap } from '#/compilers/makeStatementInfoMap';
import { CE_SCHEMA_ID_GENERATION_STYLE } from '#/databases/modules/const-enum/CE_SCHEMA_ID_GENERATION_STYLE';
import { getPlainSchemaId } from '#/modules/generators/getPlainSchemaId';
import pathe from 'pathe';
import { getTypeScriptProject } from 'ts-morph-short';
import { beforeAll, describe, expect, it } from 'vitest';

describe('getPlainSchemaId', () => {
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
      `export type TGeneric<T> = Record<string, T>`,
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

  it('id only', () => {
    const id = getPlainSchemaId({
      typeName: 'IHero',
      filePath: 'ability/IHero.ts',
      rootDirs: [pathe.resolve(process.cwd())],
      isEscape: false,
      escapeChar: '_',
      style: CE_SCHEMA_ID_GENERATION_STYLE.ID,
    });

    expect(id).toEqual('IHero');
  });

  it('id that without file path and generic(include escape)', () => {
    const id = getPlainSchemaId({
      typeName: 'TGeneric<T>',
      filePath: 'ability/TGeneric.ts',
      rootDirs: [pathe.resolve(process.cwd())],
      isEscape: true,
      escapeChar: '_',
      style: CE_SCHEMA_ID_GENERATION_STYLE.ID,
    });

    expect(id).toEqual('TGeneric_T_');
  });

  it('id that without file path and external type', () => {
    const id = getPlainSchemaId({
      typeName: 'IHeroine',
      rootDirs: [pathe.resolve(process.cwd())],
      isEscape: true,
      escapeChar: '_',
      style: CE_SCHEMA_ID_GENERATION_STYLE.ID,
    });

    expect(id).toEqual('external/IHeroine');
  });

  it('id that with file path', () => {
    const id = getPlainSchemaId({
      typeName: 'IHero',
      filePath: 'ability/IHero.ts',
      rootDirs: [pathe.resolve(process.cwd())],
      isEscape: false,
      escapeChar: '_',
      style: CE_SCHEMA_ID_GENERATION_STYLE.ID_WITH_PATH,
    });

    expect(id).toEqual('ability/IHero');
  });

  it('id that with file path', () => {
    const id = getPlainSchemaId({
      typeName: 'IHero',
      rootDirs: [pathe.resolve(process.cwd())],
      isEscape: true,
      escapeChar: '_',
      style: CE_SCHEMA_ID_GENERATION_STYLE.ID_WITH_PATH,
    });

    expect(id).toEqual('ability/IHero');
  });

  it('id that with file path and generic(include escape)', () => {
    const id = getPlainSchemaId({
      typeName: 'TGeneric<T>',
      filePath: 'ability/TGeneric.ts',
      rootDirs: [pathe.resolve(process.cwd())],
      isEscape: true,
      escapeChar: '_',
      style: CE_SCHEMA_ID_GENERATION_STYLE.ID_WITH_PATH,
    });

    expect(id).toEqual('ability/TGeneric_T_');
  });

  it('id that with file path and external type', () => {
    const id = getPlainSchemaId({
      typeName: 'IHeroine',
      rootDirs: [pathe.resolve(process.cwd())],
      isEscape: true,
      escapeChar: '_',
      style: CE_SCHEMA_ID_GENERATION_STYLE.ID_WITH_PATH,
    });

    expect(id).toEqual('external/IHeroine');
  });
});

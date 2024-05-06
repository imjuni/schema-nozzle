import { makeStatementInfoMap } from '#/compilers/makeStatementInfoMap';
import { CE_SCHEMA_ID_GENERATION_STYLE } from '#/databases/modules/const-enum/CE_SCHEMA_ID_GENERATION_STYLE';
import { getDefinitionsSchemaId } from '#/modules/generators/getDefinitionsSchemaId';
import pathe from 'pathe';
import { getTypeScriptProject } from 'ts-morph-short';
import { beforeAll, describe, expect, it } from 'vitest';

describe('getDefinitionsSchemaId', () => {
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

  it('definitions only', () => {
    const id = getDefinitionsSchemaId({
      typeName: 'IHero',
      filePath: 'ability/IHero.ts',
      rootDirs: [pathe.resolve(process.cwd())],
      isEscape: false,
      escapeChar: '_',
      style: CE_SCHEMA_ID_GENERATION_STYLE.DEFINITIONS,
    });

    expect(id).toEqual('#/$defs/IHero');
  });

  it('definitions that without file path and generic(include escape)', () => {
    const id = getDefinitionsSchemaId({
      typeName: 'TGeneric<T>',
      filePath: 'ability/TGeneric.ts',
      rootDirs: [pathe.resolve(process.cwd())],
      isEscape: true,
      escapeChar: '_',
      style: CE_SCHEMA_ID_GENERATION_STYLE.DEFINITIONS,
    });

    expect(id).toEqual('#/$defs/TGeneric_T_');
  });

  it('definitions that with file path with external type', () => {
    const id = getDefinitionsSchemaId({
      typeName: 'IHeroine',
      rootDirs: [pathe.resolve(process.cwd())],
      isEscape: true,
      escapeChar: '_',
      style: CE_SCHEMA_ID_GENERATION_STYLE.DEFINITIONS,
    });

    expect(id).toEqual('#/$defs/external-IHeroine');
  });

  it('definitions that with file path', () => {
    const id = getDefinitionsSchemaId({
      typeName: 'IHero',
      filePath: 'ability/IHero.ts',
      rootDirs: [pathe.resolve(process.cwd())],
      isEscape: false,
      escapeChar: '_',
      style: CE_SCHEMA_ID_GENERATION_STYLE.DEFINITIONS_WITH_PATH,
    });

    expect(id).toEqual('#/$defs/ability/IHero');
  });

  it('definitions that with file path', () => {
    const id = getDefinitionsSchemaId({
      typeName: 'IHero',
      rootDirs: [pathe.resolve(process.cwd())],
      isEscape: true,
      escapeChar: '_',
      style: CE_SCHEMA_ID_GENERATION_STYLE.DEFINITIONS_WITH_PATH,
    });

    expect(id).toEqual('#/$defs/ability/IHero');
  });

  it('definitions that with file path and generic(include escape)', () => {
    const id = getDefinitionsSchemaId({
      typeName: 'TGeneric<T>',
      filePath: 'ability/TGeneric.ts',
      rootDirs: [pathe.resolve(process.cwd())],
      isEscape: true,
      escapeChar: '_',
      style: CE_SCHEMA_ID_GENERATION_STYLE.DEFINITIONS_WITH_PATH,
    });

    expect(id).toEqual('#/$defs/ability/TGeneric_T_');
  });

  it('definitions that with file path and external type', () => {
    const id = getDefinitionsSchemaId({
      typeName: 'IHeroine',
      rootDirs: [pathe.resolve(process.cwd())],
      isEscape: true,
      escapeChar: '_',
      style: CE_SCHEMA_ID_GENERATION_STYLE.DEFINITIONS_WITH_PATH,
    });

    expect(id).toEqual('#/$defs/external/IHeroine');
  });
});

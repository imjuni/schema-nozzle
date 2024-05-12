import { makeStatementInfoMap } from '#/compilers/makeStatementInfoMap';
import { CE_SCHEMA_ID_GENERATION_STYLE } from '#/databases/modules/const-enum/CE_SCHEMA_ID_GENERATION_STYLE';
import { getDefinitionsSchemaId } from '#/modules/generators/getDefinitionsSchemaId';
import pathe from 'pathe';
import { getTypeScriptProject } from 'ts-morph-short';
import { beforeAll, describe, expect, it } from 'vitest';

const data: { project: ReturnType<typeof getTypeScriptProject> } = {} as any;

describe('getDefinitionsSchemaId', () => {
  beforeAll(() => {
    data.project = getTypeScriptProject($context.tsconfigFilePath);

    data.project.createSourceFile(
      pathe.join('ability/IHero.ts'),
      `export interface IHero { name: string; ability: string; }`,
    );
    data.project.createSourceFile(
      pathe.join('ability/TGeneric.ts'),
      `export type TGeneric<T> = Record<string, T>`,
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

  it('definitions only', () => {
    const id = getDefinitionsSchemaId({
      typeName: 'IHero',
      filePath: 'ability/IHero.ts',
      rootDirs: [pathe.resolve(process.cwd())],
      encoding: {
        url: false,
        jsVar: false,
      },
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
      encoding: {
        url: true,
        jsVar: true,
      },
      escapeChar: '_',
      style: CE_SCHEMA_ID_GENERATION_STYLE.DEFINITIONS,
    });

    expect(id).toEqual('#/$defs/TGeneric_T_');
  });

  it('definitions that with file path with external type', () => {
    const id = getDefinitionsSchemaId({
      typeName: 'IHeroine',
      rootDirs: [pathe.resolve(process.cwd())],
      encoding: {
        url: true,
        jsVar: false,
      },
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
      encoding: {
        url: false,
        jsVar: false,
      },
      escapeChar: '_',
      style: CE_SCHEMA_ID_GENERATION_STYLE.DEFINITIONS_WITH_PATH,
    });

    expect(id).toEqual('#/$defs/ability/IHero');
  });

  it('definitions that with file path', () => {
    const id = getDefinitionsSchemaId({
      typeName: 'IHero',
      rootDirs: [pathe.resolve(process.cwd())],
      encoding: {
        url: true,
        jsVar: false,
      },
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
      encoding: {
        url: true,
        jsVar: true,
      },
      escapeChar: '_',
      style: CE_SCHEMA_ID_GENERATION_STYLE.DEFINITIONS_WITH_PATH,
    });

    expect(id).toEqual('#/$defs/ability/TGeneric_T_');
  });

  it('definitions that with file path and external type', () => {
    const id = getDefinitionsSchemaId({
      typeName: 'IHeroine',
      rootDirs: [pathe.resolve(process.cwd())],
      encoding: {
        url: true,
        jsVar: false,
      },
      escapeChar: '_',
      style: CE_SCHEMA_ID_GENERATION_STYLE.DEFINITIONS_WITH_PATH,
    });

    expect(id).toEqual('#/$defs/external/IHeroine');
  });
});

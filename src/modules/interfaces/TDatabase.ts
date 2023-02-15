import type IDatabaseItem from '#modules/interfaces/IDatabaseItem';

export type TDatabase = Record<string, IDatabaseItem>;

export type TNullableDatabase = Record<string, IDatabaseItem | undefined>;

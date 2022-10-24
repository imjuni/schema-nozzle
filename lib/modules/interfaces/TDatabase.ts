import IDatabaseRecord from '@modules/interfaces/IDatabaseRecord';

export type TDatabase = Record<string, IDatabaseRecord>;

export type TNullableDatabase = Record<string, IDatabaseRecord | undefined>;

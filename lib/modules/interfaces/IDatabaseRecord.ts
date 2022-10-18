import { TEXPORTED_TYPE } from '@compilers/interfaces/TEXPORTED_TYPE';

export default interface IDatabaseRecord {
  id: string;
  schema: string;
  type: TEXPORTED_TYPE;
  banner?: string;
}

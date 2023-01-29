import type { TMAJOR } from './TMAJOR';

export default interface IStudentEntity {
  id: string;
  nick: string;
  age: number;
  joinAt: Date;
  major: TMAJOR;
}

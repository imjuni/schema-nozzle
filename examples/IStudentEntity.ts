import type { CE_MAJOR } from './const-enum/CE_MAJOR';

export default interface IStudentEntity {
  id: string;
  /** nick :)  */
  nick: string;
  age: number;
  joinAt: Date;
  major: CE_MAJOR;
}

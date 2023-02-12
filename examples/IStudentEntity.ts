import type { CE_MAJOR } from './CE_MAJOR';

export default interface IStudentEntity {
  id: string;
  nick: string;
  age: number;
  joinAt: Date;
  major: CE_MAJOR;
}

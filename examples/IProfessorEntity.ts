import type { CE_MAJOR } from './CE_MAJOR';

export default interface IProfessorEntity {
  id: string;
  name: string;
  age: number;
  joinAt: Date;
  major: CE_MAJOR;
}

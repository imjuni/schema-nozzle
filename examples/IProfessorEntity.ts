import type { CE_MAJOR } from './const-enum/CE_MAJOR';

export default interface IProfessorEntity {
  id: string;
  name: string;
  /** professor age33 */
  age: number;
  joinAt: Date;
  major: CE_MAJOR;
}

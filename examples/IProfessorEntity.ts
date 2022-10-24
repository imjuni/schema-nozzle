import { TMAJOR } from './TMAJOR';

export default interface IProfessorEntity {
  id: string;
  name: string;
  age: number;
  joinAt: Date;
  major: TMAJOR;
}

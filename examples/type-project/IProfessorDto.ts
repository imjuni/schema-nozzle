import type { I18nDto } from './I18nDto';
import type { IStudentDto } from './IStudentDto';
import type { IStudentEntity } from './IStudentEntity';
import type { TGenericExample } from './TGenericExample';

/**
 * IProfessorDto
 */
export interface IProfessorDto {
  id: IStudentEntity['id'];
  nick22: IStudentEntity['nick'];
  name: I18nDto['used'];
  /** professor age */
  age: IStudentEntity['age'];
  major: IStudentEntity['major'];
  students: TGenericExample<IStudentDto>;
}

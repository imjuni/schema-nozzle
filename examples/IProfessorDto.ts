import type { I18nDto } from './I18nDto';
import type { IStudentDto } from './IStudentDto';
import type { IStudentEntity } from './IStudentEntity';
import type { TGenericExample } from './TGenericExample';
import type { TSimpleSetRequired } from './TSimpleSetRequired';

/**
 * IProfessorDto
 *
 * @nozzleTag professor
 */
export interface IProfessorDto {
  id: IStudentEntity['id'];
  nick: IStudentEntity['nick'];
  name: TSimpleSetRequired<I18nDto, 'used'>;
  /** professor age */
  age: IStudentEntity['age'];
  major: IStudentEntity['major'];
  students: TGenericExample<IStudentDto>;
}

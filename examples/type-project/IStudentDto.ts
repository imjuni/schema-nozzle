import type { TSimpleSetRequired } from 'TSimpleSetRequired';
import type { I18nDto } from './I18nDto';
import type { IStudentEntity } from './IStudentEntity';

export interface IStudentDto {
  id: IStudentEntity['id'];
  nick: IStudentEntity['nick'];
  name: I18nDto;
  description: TSimpleSetRequired<I18nDto, 'used'>;
  age: IStudentEntity['age'];
  major: IStudentEntity['major'];
  joinAt: IStudentEntity['joinAt'];
}

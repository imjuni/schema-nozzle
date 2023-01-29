import type I18nDto from './I18nDto';
import type IStudentEntity from './IStudentEntity';

export default interface IStudentDto {
  id: IStudentEntity['id'];
  nick: IStudentEntity['nick'];
  name: I18nDto;
  age: IStudentEntity['age'];
  major: IStudentEntity['major'];
  joinAt: IStudentEntity['joinAt'];
}

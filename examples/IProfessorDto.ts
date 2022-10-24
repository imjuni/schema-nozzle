import I18nDto from './I18nDto';
import IStudentDto from './IStudentDto';
import IStudentEntity from './IStudentEntity';
import TGenericExample from './TGenericExample';

export default interface IProfessorDto {
  id: IStudentEntity['id'];
  nick: IStudentEntity['nick'];
  name: I18nDto;
  age: IStudentEntity['age'];
  major: IStudentEntity['major'];
  students: TGenericExample<IStudentDto>;
}

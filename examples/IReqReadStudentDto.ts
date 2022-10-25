import IStudentDto from './IStudentDto';

export default interface IReqReadStudentDto {
  Querystring: {
    name: IStudentDto['name'];
    major: IStudentDto['major'];
  };

  Param: {
    id: IStudentDto['id'];
  };
}

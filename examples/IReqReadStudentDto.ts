import IStudentDto from './IStudentDto';

export interface IReqReadStudentQuerystring {
  name: IStudentDto['name'];
}

export interface IReqReadStudentParams {
  id: IStudentDto['id'];
}

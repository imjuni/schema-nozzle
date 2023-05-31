import type IStudentDto from './IStudentDto';
import type ITid from './ITid';

/**
 * @nozzleTags hi!!, hello, tag02
 */
export interface IReqReadStudentQuerystring extends ITid {
  name: IStudentDto['name'];
  major: IStudentDto['major'];
}

/**
 * @nozzleTags hi, hello, tag01
 */
export interface IReqReadStudentParam {
  id: IStudentDto['id'];
}

/**
 * @nozzleIgnore
 */
export interface IReqReadStudentIgnoreTest {
  id: IStudentDto['id'];
}

/**
 * @nozzle-ignore
 */
export interface IReqReadStudentIgnoreAliasTest {
  id: IStudentDto['id'];
}

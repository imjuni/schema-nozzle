import IDatabaseRecord from '@modules/interfaces/IDatabaseRecord';

type TChildToParentData =
  | { command: 'record'; data: IDatabaseRecord[] }
  | { command: 'message'; data: string };

export default TChildToParentData;

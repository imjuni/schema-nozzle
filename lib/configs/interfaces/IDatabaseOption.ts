import IBaseOption from '@configs/interfaces/IBaseOption';

export default interface IDatabaseOption extends IBaseOption {
  type: 'db';

  /** output file or database file directory */
  output: string;
}

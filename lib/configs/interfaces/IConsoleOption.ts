import IBaseOption from '@configs/interfaces/IBaseOption';

export default interface IConsoleOption extends IBaseOption {
  type: 'console';

  /** output file or database file directory */
  output?: string;
}

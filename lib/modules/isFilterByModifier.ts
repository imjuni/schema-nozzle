import IBaseOption from '@configs/interfaces/IBaseOption';

export default function isFilterByModifier(option: IBaseOption, file: string): boolean {
  if (
    option.prefix != null &&
    option.prefix !== '' &&
    option.postfix != null &&
    option.postfix !== ''
  ) {
    return file.startsWith(option.prefix) !== false && file.endsWith(option.postfix) !== false;
  }

  if (option.prefix != null && option.prefix !== '') {
    return file.startsWith(option.prefix) !== false;
  }

  if (option.postfix != null && option.postfix !== '') {
    return file.endsWith(option.postfix) !== false;
  }

  return true;
}

import IBaseOption from '@configs/interfaces/IBaseOption';

export default function getFilterByModifier(option: IBaseOption, files: string[]): string[] {
  const excluded = files
    .filter((file) => {
      return option.prefix != null && option.prefix !== ''
        ? file.startsWith(option.prefix) === false
        : true;
    })
    .filter((file) => {
      return option.postfix != null && option.postfix !== ''
        ? file.endsWith(option.postfix) === false
        : true;
    });

  return excluded;
}

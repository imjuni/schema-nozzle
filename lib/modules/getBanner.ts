import IBaseOption from '@configs/interfaces/IBaseOption';

export default function getBanner(option: IBaseOption) {
  if (option.noBanner) {
    return '';
  }

  return '// generated by create-ts-json-schema';
}
import type { IGenerateOption } from '#/configs/interfaces/IGenerateOption';

export function getKeys(draft: IGenerateOption['draft']) {
  switch (draft) {
    case 1:
    case 2:
    case 3:
      return { id: 'id', def: 'definitions' };
    case 4:
    case 5:
    case 6:
    case 7:
      return { id: '$id', def: 'definitions' };
    case 8:
    default:
      return { id: '$id', def: '$defs' };
  }
}

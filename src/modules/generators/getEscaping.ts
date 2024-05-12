import { toJsVar } from '#/modules/paths/toJsVar';

interface IGetCompositeEscaperParams {
  url: boolean;
  jsVar: boolean;
}

export function getEscaping({ url, jsVar }: IGetCompositeEscaperParams) {
  if (url && jsVar) {
    const escape = (name: string, escapeChar: string) => {
      const wsRemoved = name.replace(/\s+/g, '');
      return encodeURIComponent(toJsVar(wsRemoved, escapeChar));
    };

    return escape;
  }

  if (url && !jsVar) {
    const escape = (name: string, _escapeChar: string) => {
      const wsRemoved = name.replace(/\s+/g, '');
      return encodeURIComponent(wsRemoved);
    };

    return escape;
  }

  if (!url && jsVar) {
    const escape = (name: string, escapeChar: string) => {
      const wsRemoved = name.replace(/\s+/g, '');
      return toJsVar(wsRemoved, escapeChar);
    };

    return escape;
  }

  const escape = (name: string, _escapeChar: string) => {
    const wsRemoved = name.replace(/\s+/g, '');
    return wsRemoved;
  };

  return escape;
}

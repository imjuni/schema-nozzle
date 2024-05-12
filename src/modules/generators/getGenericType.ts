import { orThrow } from 'my-easy-fp';

const reg = /^([a-zA-Z][A-Za-z0-9$_]*)<([a-zA-Z][A-Za-z0-9$_"', ]*)>\[*\]*$/;

export function getGenericType(typeName: string): {
  name: string;
  generic: boolean;
  genericName?: string;
} {
  const result = reg.exec(typeName);

  if (result == null) {
    return { name: typeName, generic: false };
  }

  return {
    name: orThrow(result[1], new Error('Cannot found generic name')),
    genericName: orThrow(result[2], new Error('Cannot found generic name')),
    generic: true,
  };
}

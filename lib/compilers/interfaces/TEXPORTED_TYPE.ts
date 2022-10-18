export const TEXPORTED_TYPE = {
  CLASS: 'class',
  VARIABLE: 'variable',
  FUNCTION: 'function',
  ARROW_FUNCTION: 'arrow-function',
  INTERFACE: 'interface',
  TYPE_ALIAS: 'type-alias',
  ENUM: 'enum',
  MODULE: 'module',
  BINDING_ELEMENT: 'binding-element',
} as const;

export type TEXPORTED_TYPE = typeof TEXPORTED_TYPE[keyof typeof TEXPORTED_TYPE];

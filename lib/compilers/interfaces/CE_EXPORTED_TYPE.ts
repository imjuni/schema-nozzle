export const CE_EXPORTED_TYPE = {
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

// eslint-disable-next-line @typescript-eslint/no-redeclare, @typescript-eslint/naming-convention
export type CE_EXPORTED_TYPE = (typeof CE_EXPORTED_TYPE)[keyof typeof CE_EXPORTED_TYPE];

export function replaceId(id: string, part?: string): string {
  const replacePart = part ?? '#/definitions/';
  const replaced = id.replace(replacePart, '');
  return replaced;
}

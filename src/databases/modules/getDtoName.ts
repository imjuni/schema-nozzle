export function getDtoName(dtoName: string, moder: (value: string) => string): string {
  if (dtoName.startsWith('#/')) {
    return dtoName;
  }

  return moder(dtoName);
}

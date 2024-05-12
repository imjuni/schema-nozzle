/**
 *
 * @param value
 * @returns
 */
export function toJsVar(value: string, escapeChar: string): string {
  // A-Z a-z 0-9 - . _
  const escapedElements = value.split('').map((element) => {
    if (/[A-Za-z0-9\-\\._]/.test(element)) {
      return element;
    }

    return escapeChar;
  });

  return escapedElements.join('');
}

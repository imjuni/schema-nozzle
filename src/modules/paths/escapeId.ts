/**
 *
 * @param id
 * @returns
 */
export function escapeId(id: string): string {
  const encoded = encodeURIComponent(id);

  if (id === encoded) {
    return id;
  }

  // A-Z a-z 0-9 - . _
  const escapedElements = id.split('').map((element) => {
    if (/[A-Za-z0-9\-\\._]/.test(element)) {
      return element;
    }

    return '_';
  });

  return escapedElements.join('');
}

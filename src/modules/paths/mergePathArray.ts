import { settify } from 'my-easy-fp';

export function mergePathArray(params: {
  prev: string[];
  next: string[];
  direction?: 'prev' | 'next' | 'intersaction' | 'union';
}) {
  switch (params.direction) {
    case 'union':
      return settify([...params.prev, ...params.next]).sort();
    case 'intersaction':
      return settify([
        // intersaction
        ...params.prev.filter((filePath) => params.next.includes(filePath)),
      ]).sort();
    case 'prev':
      return settify([
        // exists
        ...params.prev.filter((filePath) => !params.next.includes(filePath)),
        // intersaction
        ...params.prev.filter((filePath) => params.next.includes(filePath)),
      ]).sort();
    default:
      return settify([
        // intersaction
        ...params.prev.filter((filePath) => params.next.includes(filePath)),
        // added
        ...params.next.filter((filePath) => !params.prev.includes(filePath)),
      ]).sort();
  }
}

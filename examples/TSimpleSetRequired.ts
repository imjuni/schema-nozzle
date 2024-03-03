/**
 * @nozzle-ignore
 */
export type TSimpleSetRequired<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

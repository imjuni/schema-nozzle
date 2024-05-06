/**
 * @schema-nozzle-exclude
 */
export type TGenericExample<T extends { nick: string }> = Omit<T, 'nick'> &
  Partial<Pick<T, 'nick'>> & {
    /** @format date-time */
    createAt: string;
  };

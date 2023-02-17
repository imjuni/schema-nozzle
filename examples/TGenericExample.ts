type TGenericExample<T> = Omit<T, 'joinAt'> & {
  /** @format date-time */
  createAt: string;
};

export default TGenericExample;

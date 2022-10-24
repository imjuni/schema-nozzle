type TGenericExample<T> = Omit<T, 'joinAt'> & { createAt: Date };

export default TGenericExample;

type Callback<T, U> = (value: T, index: number, array: T[]) => U;

export const asyncMap = <T>(array: T[], cb: Callback<T, Promise<any>>): Promise<any> => {
  const promises = new Array(array.length);

  for (let i = 0; i < array.length; i++) {
    promises.push(cb(array[i], i, array));
  }

  return Promise.all(promises);
};

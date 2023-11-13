export function dateToIsoDate(date: Date | null): string | null {
  return (!date) ? null : date.toISOString().substring(0, 10);
}

interface IStringMap {
  [key: string]: string,
};

export function createObjectFromTuples(tuples: (string | null)[][]): IStringMap {
  let obj: IStringMap = { };

  for (const tuple of tuples) {
    if (tuple[0] && tuple[1])
      obj[tuple[0]] = tuple[1];
  }

  return obj;
}

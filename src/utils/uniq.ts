export const uniq = <T>(arr: T[]): T[] => Array.from(new Set(arr));

export const uniqNotNull = <Type, Key>(arr: (Type | undefined | null)[], by?: (e: Type) => Key): Type[] => {
  const notNullArr = arr.filter((e) => e !== undefined && e !== null) as Type[];

  return Array.from(new Map(notNullArr.map((e) => [by?.(e) ?? e, e])).values());
};

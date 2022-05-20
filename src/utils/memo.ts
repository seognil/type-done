export const memo = <Args extends unknown[], Result>(
  fn: (...args: Args) => Result,
  options?: { memoBy?: (...args: Args) => string },
) => {
  const history: Record<string, Result> = {};

  return (...args: Args): Result => {
    const key = options?.memoBy?.(...args) ?? args.map((e) => JSON.stringify(e)).join('|');
    return history[key] ?? (history[key] = fn(...args));
  };
};

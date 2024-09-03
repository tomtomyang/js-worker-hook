export type AnyFunction = (...args: any[]) => any;

export type SyncFunction<T extends AnyFunction> = (
  ...args: Parameters<T>
) => ReturnType<T>;

export type AsyncFunction<T extends AnyFunction> = (
  ...args: Parameters<T>
) => Promise<ReturnType<T>>;

export type BeforeHook<T extends AnyFunction> = (
  ...args: Parameters<T>
) => Parameters<T> | void;

export type AfterHook<T extends AnyFunction> = (
  ...args: ReturnType<T>
) => ReturnType<T> | void;

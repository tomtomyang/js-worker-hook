import type {
  AnyFunction,
  BeforeHook,
  AfterHook,
  AddEventListener,
  EventListener,
  EventRespondWith,
  Fetch,
  SubtleCryptoEncrypt,
  SubtleCryptoDecrypt,
  SyncFunction,
  AsyncFunction,
} from '../types';
import { isUndefined } from '../util';

const _HOOKS = (() => {
  const makeSyncFunctionHooked = (() => {
    function makeSyncHooksRunner<T extends AnyFunction>(hooks: T[]) {
      return function (
        this: ThisParameterType<T>,
        ...args: Parameters<T>
      ): Parameters<T> {
        let final = args;
        for (let i = 0; i < hooks.length; ++i) {
          const result = hooks[i].apply<
            ThisParameterType<T>,
            Parameters<T>,
            Parameters<T>
          >(this, final);
          final =
            Array.isArray(result) && result?.length === args?.length
              ? result
              : args;
        }
        return final;
      };
    }

    function functionHooked<T extends AnyFunction>(
      fn: T,
      h: { before: BeforeHook<T>[]; after: AfterHook<T>[] },
    ): SyncFunction<T> {
      const beforeRunner = makeSyncHooksRunner(h.before);
      const afterRunner = makeSyncHooksRunner(h.after);

      const hooked = function (
        this: ThisParameterType<T>,
        ...args: Parameters<T>
      ): ReturnType<T> {
        args = beforeRunner.apply(this, args);
        let result = fn.apply<
          ThisParameterType<T>,
          Parameters<T>,
          ReturnType<T>
        >(this, args);
        result = afterRunner.apply(this, result);
        return result;
      };

      return hooked;
    }
    return functionHooked;
  })();

  const makeAsyncFunctionHooked = (() => {
    function makeAsyncHooksRunner<T extends AnyFunction>(hooks: T[]) {
      return async function (
        this: ThisParameterType<T>,
        ...args: Parameters<T>
      ): Promise<Parameters<T>> {
        let final = args;
        for (let i = 0; i < hooks.length; ++i) {
          const result = await hooks[i].apply<
            ThisParameterType<T>,
            Parameters<T>,
            Promise<Parameters<T>>
          >(this, final);
          final =
            Array.isArray(result) && result?.length === args?.length
              ? result
              : args;
        }
        return final;
      };
    }

    function functionHooked<T extends AnyFunction>(
      fn: T,
      h: { before: BeforeHook<T>[]; after: AfterHook<T>[] },
    ): AsyncFunction<T> {
      const beforeRunner = makeAsyncHooksRunner(h.before);
      const afterRunner = makeAsyncHooksRunner(h.after);

      const hooked = async function (
        this: ThisParameterType<T>,
        ...args: Parameters<T>
      ): Promise<ReturnType<T>> {
        args = await beforeRunner.apply(this, args);
        let result = await fn.apply<
          ThisParameterType<T>,
          Parameters<T>,
          ReturnType<T>
        >(this, args);
        result = await afterRunner.apply(this, result);
        return result;
      };

      return hooked;
    }
    return functionHooked;
  })();

  function makeHook<T extends AnyFunction>(
    makeFunctionHooked:
      | typeof makeSyncFunctionHooked
      | typeof makeAsyncFunctionHooked,
  ) {
    const before: BeforeHook<T>[] = [];
    const after: AfterHook<T>[] = [];
    const hooked = (fn: T): T => makeFunctionHooked(fn, { before, after }) as T;
    return { hooked, before, after };
  }

  const hooks = {
    addEventListener: {
      ...makeHook<AddEventListener>(makeSyncFunctionHooked),
    },
    fetchListener: {
      ...makeHook<EventListener>(makeSyncFunctionHooked),
    },
    event: {
      respondWith: {
        ...makeHook<EventRespondWith>(makeSyncFunctionHooked),
      },
    },
    fetch: {
      ...makeHook<Fetch>(makeAsyncFunctionHooked),
    },
    crypto: {
      subtle: {
        encrypt: {
          ...makeHook<SubtleCryptoEncrypt>(makeAsyncFunctionHooked),
        },
        decrypt: {
          ...makeHook<SubtleCryptoDecrypt>(makeAsyncFunctionHooked),
        },
      },
    },
  };

  globalThis.addEventListener = hooks.addEventListener.hooked(addEventListener);

  if (isUndefined((addEventListener as any)?.__hooked)) {
    Object.defineProperty(addEventListener, '__hooked', {
      value: true,
      writable: true,
      enumerable: false,
      configurable: false,
    });
  } else {
    (addEventListener as any).__hooked = true;
  }

  hooks.addEventListener.before.push((type, listener) => {
    if (type === 'fetch') {
      return [type, hooks.fetchListener.hooked(listener)];
    }
    return [type, listener];
  });

  hooks.fetchListener.before.push((event) => {
    event.respondWith = hooks.event.respondWith.hooked(event.respondWith);
    return [event];
  });

  globalThis.fetch = hooks.fetch.hooked(fetch);

  globalThis.crypto.subtle.decrypt = hooks.crypto.subtle.decrypt.hooked(
    crypto.subtle.decrypt,
  );
  globalThis.crypto.subtle.encrypt = hooks.crypto.subtle.decrypt.hooked(
    crypto.subtle.encrypt,
  );

  Object.freeze(hooks);
  return hooks;
})();

export default _HOOKS;

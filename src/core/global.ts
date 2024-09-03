import { isObject } from '../util';

(() => {
  const isValidEnv = INJECT_ENV && isObject(INJECT_ENV);

  Object.defineProperty(globalThis, 'env', {
    value: isValidEnv ? INJECT_ENV : {},
    writable: false,
    enumerable: true,
    configurable: false,
  });
})();

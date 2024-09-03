import {
  isBigInt,
  isError,
  isFunction,
  isMap,
  isNull,
  isNumber,
  isSet,
  isUndefined,
} from './common';

export function getJsonCircularReplacer() {
  const seen = new WeakSet();
  return (_key: any, value: any) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular]';
      }
      seen.add(value);
    }
    return value;
  };
}

export function getFormatStackInfo(stack?: string) {
  if (!stack) {
    return '';
  }

  const stacks = stack.split('\n').slice(1);
  return stacks
    .map((line) => {
      const match = line.match(/\s+at\s+(?:(.*?)\s+\()?(.+?):(\d+):(\d+)/);
      if (match) {
        const funcName = match[1] || '<Anonymous>';
        const lineNum = match[3];
        const colNum = match[4];
        return `${funcName} ${lineNum}:${colNum}`;
      }
      return line.trim();
    })
    .join('\n');
}

export function getJsonValidData(args: any[]) {
  return args.map((arg) => {
    try {
      if (isError(arg)) {
        return arg.toString();
      }
      if (isMap(arg)) {
        return '[Map]';
      }
      if (isSet(arg)) {
        return '[Set]';
      }
      if (isUndefined(arg)) {
        return 'undefined';
      }
      if (isNull(arg)) {
        return 'null';
      }
      if (isFunction(arg)) {
        return '[Function]';
      }
      if (isBigInt(arg)) {
        return arg.toString();
      }
      if (isNumber(arg)) {
        return arg.toString();
      }

      return arg;
    } catch {
      return arg;
    }
  });
}

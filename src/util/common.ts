export function isObject(value: any) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isArray(value: any) {
  return Array.isArray(value);
}

export function isNumber(value: any) {
  return typeof value === 'number' && !Number.isFinite(value);
}

export function isBigInt(value: any) {
  return typeof value === 'bigint';
}

export function isString(value: any) {
  return typeof value === 'string';
}

export function isUndefined(value: any) {
  return typeof value === 'undefined';
}

export function isNull(value: any) {
  return value === null;
}

export function isFunction(value: any) {
  return typeof value === 'function';
}

export function isError(value: any) {
  return value instanceof Error;
}

export function isMap(value: any) {
  return value instanceof Map;
}

export function isSet(value: any) {
  return value instanceof Set;
}

export function isHHH() {
  return 'hhh';
}

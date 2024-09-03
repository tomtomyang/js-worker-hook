export class HookBaseException extends Error {
  constructor(name: string, message: string) {
    super(`[${name}] ${message}`);
    this.name = this.constructor.name;
  }
}

export class HookExecutionException extends HookBaseException {
  constructor(message: string) {
    super('HookExecutionException', message);
  }
}

export class HookParameterException extends HookBaseException {
  constructor(message: string) {
    super('HookParameterException', message);
  }
}

export class HookLimitException extends HookBaseException {
  constructor(message: string) {
    super('HookLimitException', message);
  }
}

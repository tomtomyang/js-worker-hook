import _HOOKS from '../core/hooks';

_HOOKS.crypto.subtle.encrypt.before.push(() => {});

_HOOKS.crypto.subtle.decrypt.before.push(() => {});

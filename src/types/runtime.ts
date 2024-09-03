export type AddEventListener = typeof addEventListener;
export type EventListener = (event: FetchEvent) => void;
export type EventRespondWith = FetchEvent['respondWith'];
export type Fetch = typeof fetch;
export type SubtleCryptoEncrypt = SubtleCrypto['encrypt'];
export type SubtleCryptoDecrypt = SubtleCrypto['decrypt'];
export type Console = typeof console;

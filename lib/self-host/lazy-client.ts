/**
 * [self-host] Defers construction of a third-party SDK client to first use.
 *
 * Several SDKs (OpenAI, Upstash QStash, …) throw from their constructor when no
 * credential is configured. Papermark builds those clients at module scope, and
 * `next build` imports every route to collect page data — so a single missing
 * optional key aborts the entire build. That makes integrations which are
 * documented as optional into hard build-time requirements.
 *
 * Wrapping the client in a lazy proxy keeps the original `client.foo.bar()`
 * call shape while moving any credential error to the moment the integration is
 * actually used, which is where it belongs and where it can be caught.
 */
export function lazyClient<T extends object>(factory: () => T): T {
  let instance: T | null = null;

  const get = (): T => {
    if (!instance) instance = factory();
    return instance;
  };

  return new Proxy({} as T, {
    get: (_target, prop) => {
      const client = get();
      const value = Reflect.get(client as object, prop, client);
      return typeof value === "function" ? value.bind(client) : value;
    },
    has: (_target, prop) => prop in (get() as object),
    getPrototypeOf: () => Object.getPrototypeOf(get() as object),
    ownKeys: () => Reflect.ownKeys(get() as object),
    getOwnPropertyDescriptor: (_target, prop) => {
      const descriptor = Reflect.getOwnPropertyDescriptor(
        get() as object,
        prop,
      );
      // A proxy may only report a non-configurable property if the target has
      // one, and our target is an empty object.
      return descriptor ? { ...descriptor, configurable: true } : undefined;
    },
  });
}
